const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class ChannelCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'channel',
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let { channel } = message;
    if (search) {
      const found = this.client.finderUtil.findChannels(message, search);
      if (!found) {
        message.error(message._('finder.channels.zero', search));
        return 0;
      }
      if (found.length > 1) {
        message.warn(this.client.finderUtil.formatChannels(message, found, search));
        return 0;
      }
      [channel] = found;
    }

    const description = [
      `${message.dot} ${message._('channel.id')}: **${channel.id}**`,
      `${message.dot} ${message._('channel.type')}: **${message._(`channel.types.${channel.type}`)}**`,
      `${message.dot} ${message._('channel.position')}: #**${channel.rawPosition + 1}**`,
    ];

    if (channel.type === 'text') {
      description.push(
        `${message.dot} ${message._('channel.users')}: **${channel.members.size}**`,
        `${message.dot} ${message._('channel.slowdown')}: ${channel.rateLimitPerUser > 0 ? `**${channel.rateLimitPerUser}**s` : message._('global.none')}`,
      );
    }

    if (channel.type === 'voice') {
      description.push(
        `${message.dot} ${message._('channel.bitrate')}: **${channel.bitrate / 1000}**kbps`,
        `${message.dot} ${message._('channel.users')}: **${channel.members.size}**/${channel.userLimit || '∞'}`,
      );
    }

    description.push(`${message.dot} ${message._('channel.creation')}: ${message.getMoment(channel.createdTimestamp)}`);

    const embed = new MessageEmbed().setDescription(description.join('\n'));
    if (channel.topic) embed.addField(message._('channel.topic'), channel.topic);

    const overwrites = channel.permissionOverwrites.get(message.guild.id);
    const locked = overwrites ? overwrites.deny.any(['VIEW_CHANNEL', 'CONNECT']) : false;

    let emote;
    if (channel.nsfw) emote = message.emote('text_nsfw');
    else emote = message.emote(`${channel.type}${locked ? '_locked' : ''}`);

    message.send(message._('channel.title', emote, channel.name, channel.type), embed);
    return 0;
  }
}

module.exports = ChannelCommand;
