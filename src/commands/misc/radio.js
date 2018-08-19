const { RichEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
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
    });
  }

  async execute(context) {
    const radios = await this.client.database.getDocuments('radios');
    if (radios.length === 0) return context.replyWarning(context.__('radio.list.noRadio'));

    const menu = new Menu(
      context,
      radios
        .sort((a, b) => parseFloat(a.id) - parseFloat(b.id))
        .map(r => `\`${r.id}\`: ${r.emote} **${r.name}** - ${r.language} (${r.country}) - ${r.type.map(t => context.__(`radio.types.${t}`)).join(', ')}`),
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
    if (!channel.members.has(context.message.author.id)) return context.replyWarning(context.__('radio.notInChannel'));

    const frequency = context.args[0];
    if (!frequency) return context.replyError(context.__('radio.tune.noFrequency'));

    let connection = this.client.voiceConnections.get(context.message.guild.id);
    if (!connection) connection = await channel.join();

    const radio = await this.client.database.getDocument('radios', frequency) || ({
      name: '?',
      id: 0,
    });

    const hq = (this.client.config.owners.includes(context.message.author.id) || await this.client.database.getDocument('donators', context.message.author.id));
    const message = await context.message.channel.send(context.__('radio.tune.tuning', { name: radio.name }));

    const broadcast = await this.client.other.getRadio(radio.url ? radio.id : 'NOPRG', radio.url ? (await parseURL(radio.url)) : 'file:///var/www/homer_cdn/assets/radios/NO_PROGRAMME.mp3');
    const dispatcher = await connection.playBroadcast(
      broadcast,
      {
        volume: context.settings.radio.volume || 0.5,
        bitrate: hq ? 64 : 48,
      },
    );

    if (this.client.currentBroadcasts.find(b => b.guild === context.message.guild.id)) {
      this.client.currentBroadcasts.splice(this.client.currentBroadcasts.findIndex(b => b.guild === context.message.guild.id), 1);
    }

    this.client.currentBroadcasts.push({
      guild: context.message.guild.id,
      radio: radio.id,
    });

    dispatcher.once('speaking', () => {
      message.edit(context.__('radio.tune.playing', { name: radio.name }));

      setTimeout(async () => {
        if (!connection.dispatcher) {
          const broadcast = await this.client.other.getRadio('NOPRG', 'file:///var/www/homer_cdn/assets/radios/NO_PROGRAMME.mp3');
          connection.playBroadcast(
            broadcast,
            {
              volume: context.settings.radio.volume || 0.5,
              bitrate: hq ? 64 : 48,
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
    if (!channel.members.has(context.message.author.id)) return context.replyWarning(context.__('radio.notInChannel'));

    const connection = this.client.voiceConnections.get(context.message.guild.id);
    if (!connection) return context.replyWarning(context.__('radio.stop.noActiveStream', { name: connection.channel.name }));
    await channel.leave();

    let radio = this.client.currentBroadcasts.find(b => b.guild === context.message.guild.id).radio;
    this.client.currentBroadcasts.splice(this.client.currentBroadcasts.findIndex(b => b.guild === context.message.guild.id), 1);

    const broad = this.client.voiceBroadcasts[radio];
    if (broad && broad.dispatchers.length === 0) {
      broad.destroy();
      this.client.voiceBroadcasts[radio] = undefined;
    }

    context.replySuccess(context.__('radio.stop.done'));
  }
}

class ChannelSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'channel',
      category: 'misc',
      usage: '[channel]',
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
    const currentBroadcast = this.client.currentBroadcasts.find(b => b.guild === context.message.guild.id);
    if (!currentBroadcast) return context.replyWarning(context.__('radio.info.noActiveStream'));
    if (currentBroadcast.radio === 0) return context.replyWarning(context.__('radio.info.unavailableProgramme'));
    const meta = await this.client.database.getDocument('radios', currentBroadcast.radio);

    let since = `**${context.__('global.none')}**`;
    if (this.client.voiceConnections.get(context.message.guild.id).dispatcher) {
      since = this.client.time.timeSince(Date.now() - this.client.voiceConnections.get(context.message.guild.id).dispatcher.totalStreamTime);
    }

    let playing = `**${context.__('global.noInformation')}**`;
    if (meta.stationId) {
      const request = await snekfetch.get(`https://api.radio.net/info/v2/search/nowplaying?apikey=${this.client.config.api.radio}&numberoftitles=1&station=${meta.stationId}`)
        .then(r => r.body)
        .catch(() => null);

      if (request && request[0]) {
        playing = request[0].streamTitle.split(' - ').map(a => `**${a}**`).join(' - ');
      }
    }

    const infoDescription = [
      `${this.dot} ${context.__('radio.info.embed.name')}: **[${meta.name}](${meta.website})**`,
      `${this.dot} ${context.__('radio.info.embed.language')}: **${meta.language}**`,
      `${this.dot} ${context.__('radio.info.embed.country')}: **${meta.country}**`,
      `${this.dot} ${context.__('radio.info.embed.playing')}: ${playing}`,
      `${this.dot} ${context.__('radio.info.embed.topics')}: ${meta.type.map(t => `**${context.__(`radio.types.${t}`)}**`).join(', ')}`,
      `${this.dot} ${context.__('radio.info.embed.since')}: ${since}`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(infoDescription)
      .setThumbnail(`https://${this.client.config.server.domain}/assets/radios/${meta.logo}.png?nocache=${Date.now()}`);

    context.reply(context.__('radio.info.title'), { embed });
  }
}

async function parseURL(url) {
  const extension = url.split('?')[0];

  if (extension.endsWith('m3u')) {
    const data = await snekfetch.get(url).then(r => r.text).catch(() => '');
    return parser.M3U.parse(data)[0].file;
  }

  return url;
}

module.exports = RadioCommand;
