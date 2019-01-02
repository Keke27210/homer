const Manager = require('../structures/Manager');
const request = require('superagent');
const parser = require('playlist-parser');

class RadioManager extends Manager {
  constructor(client) {
    super(client);

    this.ERROR_PATH = `${this.client.constants.CDN}/assets/radios/ERROR.mp3`;
    this.INTERRUPTION_PATH = `${this.client.constants.CDN}/assets/radios/INTERRUPTED.mp3`;
    this.service = true;
    this.broadcasts = [];
    this.stats = {};
    this.inactivity = {};
    this.volumeChange = new Set();
  }

  async createBroadcast(radio) {
    const broadcast = this.client.createVoiceBroadcast();
    broadcast.on('unsubscribe', async (dispatcher) => {
      if (this.volumeChange.has(dispatcher.player.voiceConnection.channel.guild.id)) {
        this.volumeChange.delete(dispatcher.player.voiceConnection.channel.guild.id);
        return;
      }

      // Clear broadcast if no-one else listen to the radio
      this.clearBroadcast(broadcast.radio);

      // Update radio statistics
      if (this.stats[dispatcher.player.voiceConnection.channel.guild.id]) {
        const stats = await this.client.database.getDocument('radioStats', broadcast.radio) || ({ id: broadcast.radio, entries: [] });
        const index = stats.entries.findIndex(e => e.id === dispatcher.player.voiceConnection.channel.guild.id);
        if (index === -1) {
          stats.entries.push({
            id: dispatcher.player.voiceConnection.channel.guild.id,
            time: (Date.now() - this.stats[dispatcher.player.voiceConnection.channel.guild.id].time),
          });
        } else {
          stats.entries[index].time = stats.entries[index].time + (Date.now() - this.stats[dispatcher.player.voiceConnection.channel.guild.id].time);
        }
        this.client.database.insertDocument('radioStats', stats, { conflict: 'update' });
        delete this.stats[dispatcher.player.voiceConnection.channel.guild.id];
      }
    });

    broadcast.on('error', () => this.stopBroadcast(broadcast, true));
    broadcast.on('warn', warn => this.client.logger.info(`RADIO: Broadcast warning (${broadcast.radio || '?'}): ${warn instanceof Error ? warn.message : warn}`));
    broadcast.name = radio.name;
    broadcast.radio = radio.id;
    const url = await parseURL(radio.url);
    broadcast.playStream(url, { bitrate: 96 });
    broadcast.started = true;
    this.broadcasts.push(broadcast);
    return broadcast;
  }

  async getBroadcast(frequency) {
    const radio = await this.client.database.getDocument('radios', frequency);
    if (!radio) return null;

    const broadcast = this.broadcasts.find(b => b.radio === frequency) || await this.createBroadcast(radio);
    this.client.logger.info(`RADIO: Created voice broadcast for ${radio.name} (${radio.id})`);
    return broadcast;
  }

  playError(dispatchers) {
    dispatchers.forEach((dispatcher) => {
      const newDispatcher = dispatcher.player.voiceConnection.playStream(this.ERROR_URL, { bitrate: 64 });
      newDispatcher.on('end', () => dispatcher.player.voiceConnection.channel.leave());
    });
  }

  stopBroadcast(broadcast, error) {
    broadcast.dispatchers.forEach((dispatcher) => {
      dispatcher.end();
      dispatcher.player.voiceConnection.playStream(error ? this.ERROR_PATH : this.INTERRUPTION_PATH, { volume: 1, bitrate: 64 })
        .on('error', () => dispatcher.player.voiceConnection.disconnect())
        .once('end', () => dispatcher.player.voiceConnection.disconnect());
    });

    broadcast.destroy();
    this.broadcasts.splice(this.broadcasts.findIndex(b => b.radio === broadcast.radio), 1);
    if (error) this.client.logger.info(`RADIO: Voice broadcast error for ${broadcast.radio}`);
    else this.client.logger.info(`RADIO: Interrupted service for ${broadcast.radio}`);
  }

  clearBroadcast(radio) {
    const broadcast = this.broadcasts.find(b => b.radio === radio);
    if (!broadcast) return;
    broadcast.destroy();
    this.broadcasts.splice(this.broadcasts.findIndex(b => b.radio === broadcast.radio), 1);
    this.client.logger.info(`RADIO: Destroyed broadcast for ${broadcast.name} (${broadcast.radio})`);
  }

  dispatcherError(context, dispatcher, error) {
    if (context) context.replyWarning(context.__('radio.dispatcherError'));
    dispatcher.end();
    dispatcher.player.voiceConnection.disconnect();
    this.client.logger.info(`RADIO: Dispatcher error (guild ${context ? context.message.guild.id : dispatcher.player.voiceConnection.channel.guild.id}): ${error.message}`);
  }

  rebootMessage(context, shutdown = false) {
    if (context) context.replyWarning(context.__(`radio.system.${shutdown ? 'shutdown' : 'reboot'}`));
  }

  async saveSessions() {
    const sessions = {};
    this.broadcasts.forEach(b => { sessions[b.radio] = b.dispatchers.map(d => d.player.voiceConnection.channel.guild.id) });
    await this.client.database.updateDocument('bot', 'settings', { sessions });
    return true;
  }

  async resumeSessions() {
    const sessions = await this.client.database.getDocument('bot', 'settings').then(s => s.sessions);
    if (!sessions) return;

    for (const radio of Object.keys(sessions)) {
      const broadcast = await this.getBroadcast(radio);
      sessions[radio].forEach(async (id) => {
        const settings = await this.client.database.getDocument('settings', id);
        if (!settings) return;

        const voiceChannel = this.client.channels.get(settings.radio.channel);
        if (!voiceChannel) return;

        voiceChannel.join()
          .then((vc) => {
            const dispatcher = await vc.playBroadcast(broadcast);
            dispatcher.on('error', error => this.client.radio.dispatcherError(null, dispatcher, error));
            dispatcher.on('reboot', shutdown => this.client.radio.rebootMessage(null, shutdown));
            dispatcher.once('speaking', () => message.edit(context.__('radio.tune.playing', { name: broadcast.name })));
          })
          .catch(() => null);
      });
    }

    this.client.database.updateDocument('bot', 'settings', { sessions: null });
  }
}

async function parseURL(url) {
  const path = url.split('?')[0];
  const extension = ['pls', 'm3u'].find(e => path.toLowerCase().endsWith(e));

  if (extension) {
    const data = await request.get(url).then(r => r.text).catch(() => '');
    return parser[extension.toUpperCase()].parse(data)[0].file;
  }

  return url;
}

module.exports = RadioManager;
