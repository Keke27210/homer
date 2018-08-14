const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class ChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'channel',
      category: 'general',
      usage: '[channel]',
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let { channel } = context.message;
    if (search) {
      const foundChannels = this.client.finder.findRolesOrChannels(context.message.guild.channels, search);
      if (!foundChannels || foundChannels.length === 0 || !foundChannels[0]) return context.replyError(context.__('finderUtil.findChannels.zeroResult', { search }));
      if (foundChannels.length === 1) channel = foundChannels[0];
      else if (foundChannels.length > 1) return context.replyWarning(this.client.finder.formatChannels(foundChannels, context.settings.misc.locale));
    }

    const channelInformation = [
      `${this.dot} ${context.__('channel.embed.id')}: **${channel.id}**`,
      `${this.dot} ${context.__('channel.embed.type')}: **${context.__(`channel.type.${channel.type}`)}**`,
      `${this.dot} ${context.__('channel.embed.position')}: #**${context.message.guild.channels.sort((a, b) => a.position - b.position).array().findIndex(c => c.id === channel.id) + 1}**`,
    ];

    if (channel.type === 'voice') channelInformation.push(`${this.dot} ${context.__('channel.embed.bitrate')}: **${channel.bitrate}**Kbps`);
    if (channel.type !== 'category') channelInformation.push(`${this.dot} ${context.__('channel.embed.users')}: **${channel.members.size}**${channel.type === 'voice' ? `/**${channel.userLimit === 0 ? '∞' : channel.userLimit}**` : ''}`);
    channelInformation.push(`${this.dot} ${context.__('channel.embed.creation')}: **${context.formatDate(channel.createdTimestamp)}**`);

    const embed = new RichEmbed()
      .setDescription(channelInformation);

    if (channel.topic) {
      embed.addField(context.__('channel.embed.topic'), channel.topic);
    }

    context.reply(
      context.__('channel.title', {
        name: channel.type === 'text' ? `**#${channel.name}**` : `**${channel.name}**`,
      }),
      { embed },
    );
  }
}

module.exports = ChannelCommand;
