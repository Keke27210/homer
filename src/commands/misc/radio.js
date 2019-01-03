const { RichEmbed } = require('discord.js');
const request = require('snekfetch');
const Command = require('../../structures/Command');

class RadioCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'radio',
      category: 'misc',
      children: [
        new ListSubcommand(client),
        new TuneSubcommand(client),
        new VolumeSubcommand(client),
        new StopSubcommand(client),
        new ChannelSubcommand(client),
        new InfoSubcommand(client),
        new DiscoverSubcommand(client),
        new SessionsSubcommand(client),
        new SwitchSubcommand(client),
        new StatsSubcommand(client),
        new ProgrammesSubcommand(client),
      ],
    });
  }

  async execute(context) {
    context.reply(context.__('radio.hub', { prefix: this.client.prefix }));
  }
}

class ListSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const radios = await this.client.database.getDocuments('radios', true);
    if (radios.length === 0) return context.replyWarning(context.__('radio.list.noRadio'));

    const pageCount = Math.ceil(radios.length / 10);
    const pages = [];
    for (let i = 0; i < pageCount; i += 1) {
      pages.push({ footer: context.__('radio.list.footer', { command: `${this.client.prefix}radio tune <frequency>`, page: `${i + 1}/${pageCount}` }) });
    }

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('radio.list.title', { name: this.client.user.username }),
      pages,
      radios
        .sort((a, b) => parseFloat(a.id) - parseFloat(b.id))
        .map(r => `\`${r.id}\`: ${r.emote} [${r.name}](${r.website}) - ${r.broken ? context.__('radio.broken') : `${r.language} (${r.country}) - ${r.type.map(t => context.__(`radio.types.${t}`)).join(', ')}`}`),
    );
  }
}

class TuneSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tune',
      category: 'misc',
      usage: '<frequency>',
    });
  }

  async execute(context) {
    const channel = context.message.guild.channels.get(context.settings.radio.channel);
    if (!channel) return context.replyWarning(context.__('radio.noRadioChannel', { prefix: this.client.prefix }));
    if (!channel.joinable || !channel.speakable) return context.replyError(context.__('radio.cannotJoinOrSpeak', { name: channel.name }));
    if (!channel.members.has(context.message.author.id)) return context.replyWarning(context.__('radio.notInChannel', { name: channel.name }));

    if (!this.client.radio.service) return context.replyWarning(context.__('radio.disabledService'));

    const frequency = context.args[0] ? parseFloat(context.args[0].replace(/,/g, '.')) : null;
    if (!frequency) return context.replyError(context.__('radio.tune.noFrequency'));

    let connection = this.client.voiceConnections.get(context.message.guild.id);
    if (!connection) connection = await channel.join();

    const message = await context.message.channel.send(context.__('radio.tune.tuning', { frequency }));

    const broadcast = await this.client.radio.getBroadcast(frequency.toString());
    if (!broadcast) return message.edit(context.__('radio.tune.noProgramme', { frequency }));
  
    const dispatcher = await connection.playBroadcast(broadcast, {
      bitrate: this.client.other.isDonator(context.message.author.id) ? 96 : 48,
      volume: context.settings.radio.volume || 0.5,
    });

    dispatcher.on('error', error => this.client.radio.dispatcherError(context, dispatcher, error));
    dispatcher.on('reboot', shutdown => this.client.radio.rebootMessage(context, shutdown));
    dispatcher.once('speaking', () => message.edit(context.__('radio.tune.playing', { name: broadcast.name })));

    setTimeout(() => {
      this.client.radio.stats[context.message.guild.id] = {
        radio: broadcast.radio,
        time: Date.now() - 1000,
      };
    }, 1000);
  }
}

class VolumeSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      category: 'misc',
      usage: '<volume (0-100)>',
    });
  }

  async execute(context) {
    const channel = context.message.guild.channels.get(context.settings.radio.channel);
    if (!channel) return context.replyWarning(context.__('radio.noRadioChannel', { prefix: this.client.prefix }));
    if (!channel.joinable || !channel.speakable) return context.replyError(context.__('radio.cannotJoinOrSpeak', { name: channel.name }));
    if (!channel.members.has(context.message.author.id)) return context.replyWarning(context.__('radio.notInChannel', { name: channel.name }));

    let volume = context.args[0];
    if (!volume) return context.reply(context.__('radio.volume.currentVolume', { volume: (context.settings.radio.volume * 100) }));
    if (isNaN(parseInt(volume)) || volume < 0 || volume > 100) return context.replyError(context.__('radio.volume.invalidVolume'));

    volume = (volume / 100).toFixed(2);
    context.settings.radio.volume = volume;
    await context.saveSettings();

    const voiceConnection = context.message.guild.voiceConnection;
    if (voiceConnection && voiceConnection.dispatcher) {
      this.client.radio.volumeChange.add(context.message.guild.id);
      voiceConnection.dispatcher.setVolume(volume);
    }

    context.replySuccess(context.__('radio.volume.set', { volume: (volume * 100) }));
  }
}

class StopSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stop',
      aliases: ['stfu'],
      category: 'misc',
    });
  }

  async execute(context) {
    const channel = context.message.guild.channels.get(context.settings.radio.channel);
    if (!channel) return context.replyWarning(context.__('radio.noRadioChannel', { prefix: this.client.prefix }));
    if (!channel.joinable || !channel.speakable) return context.replyError(context.__('radio.cannotJoinOrSpeak', { name: channel.name }));
    if (!channel.members.has(this.client.user.id)) return context.replyWarning(context.__('radio.botNotInChannel'));
    if (!channel.members.has(context.message.author.id)) return context.replyWarning(context.__('radio.notInChannel', { name: channel.name }));

    await channel.leave();
    context.replySuccess(context.__('radio.stop.done'));
  }
}

class ChannelSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'channel',
      category: 'misc',
      usage: '[channel]',
      children: [new ChannelClearSubcommand(client)],
      userPermissions: ['MANAGE_GUILD'],
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let channel = context.message.guild.channels.filter(c => c.type === 'voice').find(c => c.members.has(context.message.author.id));
    if (search) {
      const foundChannels = this.client.finder.findRolesOrChannels(context.message.guild.channels.filter(c => c.type === 'voice'), search);
      if (!foundChannels || foundChannels.length === 0 || !foundChannels[0]) return context.replyError(context.__('finderUtil.findChannels.zeroResult', { search }));
      if (foundChannels.length === 1) channel = foundChannels[0];
      else if (foundChannels.length > 1) return context.replyWarning(this.client.finder.formatChannels(foundChannels, context.settings.misc.locale));
    }
    if (!channel) return context.replyWarning(context.__('radio.channel.noChannelFound'));
    if (!channel.joinable || !channel.speakable) return context.replyError(context.__('radio.cannotJoinOrSpeak', { name: channel.name }));

    context.settings.radio.channel = channel.id;
    await context.saveSettings();
    context.replySuccess(context.__('radio.channel.set', { name: channel.name }));

    if (context.message.guild.voiceConnection) {
      const currentRadio = this.client.radio.broadcasts
        .find(b => b.dispatchers.find(d => d.player.voiceConnection.channel.id === context.message.guild.voiceConnection.channel.id))
        .radio;
      await context.message.guild.voiceConnection.disconnect();

      const connection = await channel.join();
      const broadcast = await this.client.radio.getBroadcast(currentRadio);
      const dispatcher = await connection.playBroadcast(broadcast, { volume: context.settings.radio.volume || 0.5 });
      dispatcher.on('error', error => this.client.radio.dispatcherError(context, dispatcher, error));
      dispatcher.on('reboot', shutdown => this.client.radio.rebootMessage(context, shutdown));
      dispatcher.once('speaking', () => message.edit(context.__('radio.tune.playing', { name: broadcast.name })));

      context.replyWarning(context.__('radio.channel.botMoved'));
    }
  }
}

class ChannelClearSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      category: 'misc',
      userPermissions: ['MANAGE_GUILD'],
    });
  }

  async execute(context) {
    const channel = context.message.guild.channels.get(context.settings.radio.channel);
    if (!channel) return context.replyWarning(context.__('radio.noRadioChannel', { prefix: this.client.prefix }));

    context.settings.radio.channel = null;
    await context.saveSettings();
    context.replySuccess(context.__('radio.channel.clear.cleared'));
    if (context.message.guild.voiceConnection) {
      context.message.guild.voiceConnection.disconnect();
      context.replyWarning(context.__('radio.channel.clear.disconnected'));
    }
  }
}

class InfoSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      category: 'misc',
    });
  }

  async execute(context) {
    const currentBroadcast = this.client.radio.broadcasts.find(b => b.dispatchers.find(d => d.player.voiceConnection.channel.guild.id === context.message.guild.id));
    if (!currentBroadcast) return context.replyWarning(context.__('radio.info.noActiveStream'));
    if (currentBroadcast.radio === 0) return context.replyWarning(context.__('radio.info.unavailableProgramme'));
    const meta = await this.client.database.getDocument('radios', currentBroadcast.radio);

    let playing = context.__('global.noInformation');
    let image = `${this.client.constants.CDN}/assets/radios/${meta.logo}.png?nocache=${Date.now()}`;
    if (meta.stationId) {
      // radio.net
      if (meta.stationId.startsWith('RADIONET_')) {
        const req = await request.get(`https://api.radio.net/info/v2/search/nowplaying?apikey=${this.client.config.api.radio}&numberoftitles=1&station=${meta.stationId.split('_')[1]}`)
          .then(r => r.body)
          .catch(() => null);

        if (req && req[0]) {
          playing = req[0].streamTitle;
        }
      }
      // tune-in
      else if (meta.stationId.startsWith('TUNEIN_')) {
        const req = await request.get(`https://feed.tunein.com/profiles/s${meta.stationId.split('_')[1]}/nowPlaying`)
          .then(r => r.body)
          .catch(() => null);

        if (req) {
          const programme = req.Secondary || req.Primary || req.Header;
          playing = programme.Title;
          if (programme.Image !== 'http://cdn-radiotime-logos.tunein.com/p0q.png') image = programme.Image;
        }
      }
    }

    const infoDescription = [
      `${meta.emote} **[${meta.name}](${meta.website})** - ${meta.id}MHz`,
      `🎵 ${playing}`,
      `🚩 ${meta.language} (${meta.country})`,
      `🔖 ${meta.type.map(t => context.__(`radio.types.${t}`)).join(', ')}`,
      `🔈 ${getVolume(this.client.voiceConnections.get(context.message.guild.id).dispatcher.volume)}`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(infoDescription)
      .setThumbnail(image);

    context.reply(context.__('radio.info.title'), { embed });
  }
}

class StatsSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const radioStats = await this.client.database.getDocuments('radioStats', true);
    if (radioStats.length === 0) return context.replyWarning(context.__('radio.stats.noStats'));
    const radios = await this.client.database.getDocuments('radios', true);

    const pages = [];

    // Guild stats
    if (context.message.guild) {
      const guildRanking = radioStats
        .map(r => ({ id: r.id, time: (r.entries.find(e => e.id === context.message.guild.id) || {}).time || 0 }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 10);

      pages.push([
        `🏠 **${context.message.guild.name}**`,
        '',
        guildRanking
          .filter(r => r.time > 0)
          .map((r, i) => {
            const radio = radios.find(rad => rad.id === r.id);
            return `**${i + 1}.** ${radio.emote} **${radio.name}**: ${this.client.time.timeSince(Date.now() + r.time, context.settings.misc.locale, true, false)}`;
          }).join('\n') || context.__('global.none'),
      ].join('\n'));
    }

    // Global stats
    const globalRanking = radioStats
      .map(r => ({ id: r.id, time: (r.entries.reduce((prev, val) => prev + val.time, 0)) || 0 }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    pages.push([
      `🌐 **${context.__('radio.stats.allServers')}**`,
      '',
      globalRanking.map((r, i) => {
        const radio = radios.find(rad => rad.id === r.id);
        return `**${i + 1}.** ${radio.emote} **${radio.name}**: ${this.client.time.timeSince(Date.now() + r.time, context.settings.misc.locale, true, false)}`;
      }).join('\n') || context.__('global.none'),
    ].join('\n'));

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('radio.stats.main'),
      null,
      pages,
      { entriesPerPage: 1, footer: context.__('radio.stats.footer') },
    );
  }
}

class SessionsSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sessions',
      category: 'misc',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const voiceBroadcasts = this.client.radio.broadcasts;
    if (voiceBroadcasts.length === 0) return context.replyWarning('There are no active sessions at the moment.');

    const sessions = [];
    for (const voiceBroadcast of voiceBroadcasts) {
      const radio = await this.client.database.getDocument('radios', voiceBroadcast.radio) || ({ emote: '?', name: 'Unknown', id: '000.0', url: '?' });

      const page = [
        `${radio.emote} **${radio.name}** - **${radio.id}**Mhz`,
        `📡 [BROADCASTED AUDIO](${radio.url}) @ **OPUS 96Kbps**`,
        '',
        '🔌 Active sessions:',
      ];

      if (voiceBroadcast.dispatchers.length === 0) page.push('None');
      for (let i = 0; i < voiceBroadcast.dispatchers.length; i += 1) {
        const dispatcher = voiceBroadcast.dispatchers[i];
        const voiceConnection = dispatcher.player.voiceConnection;
        page.push(`- **${voiceConnection.channel.guild.name}** | 🎧 **${voiceConnection.channel.members.filter(m => !m.user.bot).size}** | 🔈 **${Math.floor(dispatcher.volume * 100)}**% (**${Math.floor(dispatcher.volumeDecibels)}**db) | 🕛 ${this.client.time.timeSince((Date.now() - dispatcher.totalStreamTime), 'en-gb', true)}`);
      }

      sessions.push(page.join('\n'));
    }

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      '📻 Current radio sessions:',
      null,
      sessions,
    );
  }
}

class DiscoverSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'discover',
      aliases: ['featured', 'programmes'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const featured = await this.client.database.getDocuments('radioFeatured', true)
      .then(a => shuffleArray(a));
    if (featured.length === 0) return context.replyWarning(context.__('radio.discover.noFeaturedProgramme'));

    const pages = [];
    const entries = [];
    for (let i = 0; i < featured.length; i += 1) {
      const programme = featured[i];
      const radio = await this.client.database.getDocument('radios', programme.radio);
      if (!radio) continue; // Should never happen but I got some errors on it (??? unknown source ???)

      pages.push({ title: programme.title, thumb: programme.thumbnail, color: programme.color, footer: context.__('radio.discover.footer', { frequency: programme.radio }) });
      entries.push([
        programme.text,
        '',
        `${radio.emote} **[${radio.name}](${radio.website})** - **${radio.id}**Mhz`,
      ].join('\n'));
    }

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('radio.discover.main'),
      pages,
      entries,
      { entriesPerPage: 1 },
    );
  }
}

class SwitchSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'switch',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    if (this.client.radio.service) {
      this.client.radio.service = false;
      this.client.radio.broadcasts.forEach(b => this.client.radio.stopBroadcast(b, false));
      context.replySuccess('The radio service has been disabled successfully!');
    } else {
      this.client.radio.service = true;
      context.replySuccess('The radio service has been enabled successfully!');
    }
  }
}

class ProgrammesSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'programmes',
      aliases: ['onair', 'broadcasts'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const radios = await this.client.database.getDocuments('radios', true)
      .then(radios => radios.filter(r => r.stationId));

    const entries = [];
    const pages = [];

    for (const radio of radios) {
      let playing = context.__('global.noInformation');
      let image = `${this.client.constants.CDN}/assets/radios/${radio.logo}.png?nocache=${Date.now()}`;

      // radio.net
      if (radio.stationId.startsWith('RADIONET_')) {
        const req = await request.get(`https://api.radio.net/info/v2/search/nowplaying?apikey=${this.client.config.api.radio}&numberoftitles=1&station=${radio.stationId.split('_')[1]}`)
          .then(r => r.body)
          .catch(() => null);

        if (req && req[0]) {
          playing = req[0].streamTitle;
        } else {
          continue;
        }
      }
      // tune-in
      else if (radio.stationId.startsWith('TUNEIN_')) {
        const req = await request.get(`https://feed.tunein.com/profiles/s${radio.stationId.split('_')[1]}/nowPlaying`)
          .then(r => r.body)
          .catch(() => null);

        if (req) {
          const programme = req.Secondary || req.Primary || req.Header;
          playing = programme.Title;
          if (programme.Image !== 'http://cdn-radiotime-logos.tunein.com/p0q.png') image = programme.Image;
        }
      }

      entries.push([
        `${radio.emote} **${radio.name}** - **${radio.id}**Mhz`,
        '',
        playing,
      ].join('\n'));

      pages.push({
        title: ' ',
        footer: context.__('radio.programmes.footer', { name: radio.name, prefix: this.client.prefix, id: radio.id }),
        thumb: image,
        time: new Date(),
      });
    }

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('radio.programmes.main', { name: this.client.user.username }),
      pages,
      entries,
      { entriesPerPage: 1 },
    );
  }
}

function getVolume(volume) {
  let str = '──────────';
  const index = Math.round(volume * 10);
  return str.substring(0, index - 1) + '○' + str.substring(index);
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

module.exports = RadioCommand;
