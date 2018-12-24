const { RichEmbed } = require('discord.js');
const request = require('snekfetch');
const parser = require('playlist-parser');
const Menu = require('../../structures/Menu');
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
        new SessionsSubcommand(client),
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

    const menu = new Menu(
      context,
      radios
        .sort((a, b) => parseFloat(a.id) - parseFloat(b.id))
        .map(r => `\`${r.id}\`: ${r.emote} [${r.name}](${r.website}) - ${r.language} (${r.country}) - ${r.type.map(t => context.__(`radio.types.${t}`)).join(', ')}`),
    );

    menu.send(context.__('radio.list.title', { name: this.client.user.username }));
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

    const frequency = context.args[0] ? context.args[0].replace(/,/g, '.') : null;
    if (!frequency) return context.replyError(context.__('radio.tune.noFrequency'));

    let connection = this.client.voiceConnections.get(context.message.guild.id);
    if (!connection) connection = await channel.join();

    const currentBroad = this.client.currentBroadcasts[context.message.guild.id];
    const radio = await this.client.database.getDocument('radios', frequency) || ({
      name: '?',
      id: 0,
    });

    const hq = (this.client.config.owners.includes(context.message.author.id) || await this.client.database.getDocument('donators', context.message.author.id));
    const message = await context.message.channel.send(context.__('radio.tune.tuning', { name: radio.name }));

    const broadcast = await this.client.other.getRadio(radio.url ? radio.id : 'NOPRG', radio.url ? (await parseURL(radio.url)) : `${this.client.constants.CDN}/assets/radios/NO_PROGRAMME.mp3`);
    const dispatcher = await connection.playBroadcast(
      broadcast,
      {
        volume: context.settings.radio.volume || 0.5,
        bitrate: hq ? 64000 : 48000,
      },
    );

    const broad = this.client.voiceBroadcasts[currentBroad];
    if (broad && broad.dispatchers.length === 0) {
      broad.destroy();
      delete this.client.voiceBroadcasts[currentBroad];
    }

    delete this.client.currentBroadcasts[context.message.guild.id];
    this.client.currentBroadcasts[context.message.guild.id] = radio.id;

    dispatcher.once('error', (message) => {
      context.message.channel.send(context.__('radio.tune.error', { message }));
      delete this.client.currentBroadcasts[context.message.guild.id];
      if (channel.members.has(this.client.user.id)) channel.leave();
    });

    dispatcher.once('speaking', () => {
      message.edit(context.__('radio.tune.playing', { name: radio.name }));

      setTimeout(async () => {
        if (!connection.dispatcher) {
          const broadcast = await this.client.other.getRadio('NOPRG', `${this.client.constants.CDN}/assets/radios/NO_PROGRAMME.mp3`);
          connection.playBroadcast(
            broadcast,
            {
              volume: context.settings.radio.volume || 0.5,
              bitrate: hq ? 64000 : 48000,
            },
          );
        }
      }, 2500);
    });
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
    if (isNaN(parseInt(volume)) || volume < 0 || volume > 100) return context.replyError(context.__('radio.volume.invalidVolume'));

    volume = (volume / 100).toFixed(2);
    context.settings.radio.volume = volume;
    await context.saveSettings();

    const currentBroadcast = this.client.voiceConnections.get(context.message.guild.id);
    if (currentBroadcast && currentBroadcast.dispatcher) await currentBroadcast.dispatcher.setVolume(volume);

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

    const connection = this.client.voiceConnections.get(context.message.guild.id);
    if (!connection) return context.replyWarning(context.__('radio.stop.noActiveStream', { name: connection.channel.name }));
    await channel.leave();

    delete this.client.currentBroadcasts[context.message.guild.id];
    /*const broad = this.client.voiceBroadcasts[currentBroadcast.radio];
    if (broad && broad.dispatchers.length === 0) {
      broad.destroy();
      delete this.client.voiceBroadcasts[currentBroadcast.radio];
    }*/

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

    context.settings.radio.channel = channel.id;
    await context.saveSettings();

    context.replySuccess(context.__('radio.channel.set', { name: channel.name }));
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

    context.settings.radio.channel = '0';
    await context.saveSettings();
    context.replySuccess(context.__('radio.channel.clear.cleared'));
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
    const currentBroadcast = this.client.currentBroadcasts[context.message.guild.id];
    if (!currentBroadcast) return context.replyWarning(context.__('radio.info.noActiveStream'));
    if (currentBroadcast.radio === 0) return context.replyWarning(context.__('radio.info.unavailableProgramme'));
    const meta = await this.client.database.getDocument('radios', currentBroadcast);

    let playing = context.__('global.noInformation');
    if (meta.stationId) {
      const req = await request.get(`https://api.radio.net/info/v2/search/nowplaying?apikey=${this.client.config.api.radio}&numberoftitles=1&station=${meta.stationId}`)
        .then(r => r.body)
        .catch(() => null);

      if (req && req[0]) {
        playing = request[0].streamTitle;
      }
    }

    const infoDescription = [
      `🎛 **[${meta.name}](${meta.website})** - ${meta.id} MHz`,
      `🎵 ${playing}`,
      `🚩 ${meta.language} (${meta.country})`,
      `🔖 ${meta.type.map(t => context.__(`radio.types.${t}`)).join(', ')}`,
      `🔈 ${getVolume(this.client.voiceConnections.get(context.message.guild.id).dispatcher.volume)}`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(infoDescription)
      .setThumbnail(`${this.client.constants.CDN}/assets/radios/${meta.logo}.png?nocache=${Date.now()}`);

    context.reply(context.__('radio.info.title'), { embed });
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
    const voiceBroadcasts = Object.entries(this.client.voiceBroadcasts);
    if (voiceBroadcasts.length === 0) return context.replyWarning('There are no active sessions at the moment.');

    const sessions = [];
    for (const [id, voiceBroadcast] of voiceBroadcasts) {
      const radio = id === 'NOPRG' ? ({ emote: '🚫', name: 'NO PROGRAMME', id: '000.0' }) : await this.client.database.getDocument('radios', id);

      const page = [
        `${radio.emote} **${radio.name}** - **${radio.id}**Mhz`,
        `📡 [BROADCASTED AUDIO](${radio.url})`,
        '',
        '🔌 Active sessions:',
      ];

      if (voiceBroadcast.dispatchers.length === 0) page.push('None');
      for (let i = 0; i < voiceBroadcast.dispatchers.length; i += 1) {
        const dispatcher = voiceBroadcast.dispatchers[i];
        const voiceConnection = dispatcher.player.voiceConnection;
        page.push(`- **[${voiceConnection.channel.guild.name}](https://www.google.com/search?q=${voiceConnection.channel.guild.id})** | 🎧 **${voiceConnection.channel.members.filter(m => !m.user.bot).size}** | 🔈 **${Math.floor(dispatcher.volume * 100)}**% (**${Math.floor(dispatcher.volumeDecibels)}**db) | 🕛 ${this.client.time.timeSince((Date.now() - dispatcher.totalStreamTime), 'en-gb', true)}`);
      }

      sessions.push(page.join('\n'));
    }

    const menu = new Menu(
      context,
      sessions,
      { entriesPerPage: 1 },
    );

    menu.send('📻 Active radio streams:');
  }
}

class DiscoverSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'discover',
      aliases: ['featured'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const featured = await this.client.database.getDocuments('radioFeatured', true)
      .then(a => shuffleArray(a));
    if (featured.length === 0) return context.reply(context.__('radio.discover.noFeaturedProgramme'));

    const pages = [];
    const titles = [];
    const thumbnails = [];
    for (let i = 0; i < featured.length; i += 1) {
      const programme = featured[i];
      const radio = await this.client.database.getDocument('radios', programme.radio);

      titles.push(programme.title);
      thumbnails.push(programme.thumbnail || null);
      pages.push([
        programme.text,
        '',
        `${radio.emote} **${radio.name}** - **${radio.id}**Mhz`,
      ].join('\n'));
    }

    const menu = new Menu(
      context,
      pages,
      {
        titles,
        entriesPerPage: 1,
        thumbnails,
        footer: context.__('radio.discover.embedFooter'),
      },
    );

    menu.send(``);
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
}

module.exports = RadioCommand;
