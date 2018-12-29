const Manager = require('../structures/Manager');
const request = require('superagent');
const parser = require('playlist-parser');
//const { writeFileSync } = require('fs');

class RadioManager extends Manager {
  constructor(client) {
    super(client);

    this.ERROR_PATH = `${this.client.constants.CDN}/assets/radios/ERROR.mp3`;
    this.INTERRUPTION_PATH = `${this.client.constants.CDN}/assets/radios/INTERRUPTED.mp3`;
    this.service = true;
    this.broadcasts = [];
    this.inactivity = {};
  }

  async createBroadcast(radio, playError = true) {
    const broadcast = this.client.createVoiceBroadcast();
    broadcast.on('unsubscribe', () => this.clearBroadcast(broadcast.radio));
    broadcast.on('error', error => this.stopBroadcast(broadcast, true));
    broadcast.on('warn', warn => this.client.print(`RADIO: Broadcast warning (${broadcast.radio || '?'}): ${warn instanceof Error ? warn.message : warn}`));
    broadcast.name = radio.name;
    broadcast.radio = radio.id;
    const url = await parseURL(radio.url);
    broadcast.playStream(url, { bitrate: 64 });
    broadcast.started = true;
    this.broadcasts.push(broadcast);
    return broadcast;
  }

  async getBroadcast(frequency) {
    const radio = await this.client.database.getDocument('radios', frequency);
    if (!radio) return null;

    const broadcast = this.broadcasts.find(b => b.radio === frequency) || await this.createBroadcast(radio);
    this.client.print(`RADIO: Created voice broadcast for ${radio.name} (${radio.id})`);
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
      dispatcher.player.voiceConnection.playStream(error ? this.ERROR_PATH : INTERRUPTION_PATH, { volume: 1, bitrate: 64 })
        .on('error', () => dispatcher.player.voiceConnection.disconnect())
        .once('end', () => dispatcher.player.voiceConnection.disconnect());
    });

    broadcast.destroy();
    this.broadcasts.splice(this.broadcasts.findIndex(b => b.radio === broadcast.radio), 1);
    if (error) this.client.print(`RADIO: Voice broadcast error for ${broadcast.radio}`);
    else this.client.print(`RADIO: Interrupted service for ${broadcast.radio}`);
  }

  clearBroadcast(radio) {
    const broadcast = this.broadcasts.find(b => b.radio === radio);
    if (!broadcast) return;
    broadcast.destroy();
    this.broadcasts.splice(this.broadcasts.findIndex(b => b.radio === broadcast.radio), 1);
    this.client.print(`RADIO: Destroyed broadcast for ${broadcast.name} (${broadcast.radio})`);
  }

  dispatcherError(context, dispatcher, error) {
    context.replyWarning(context.__('radio.dispatcherError'));
    dispatcher.end();
    dispatcher.player.voiceConnection.disconnect();
    this.client.print(`RADIO: Dispatcher error (guild ${context.message.guild.id}): ${error.message}`);
  }

  rebootMessage(context, shutdown = false) {
    context.replyWarning(context.__(`radio.system.${shutdown ? 'shutdown' : 'reboot'}`));
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
