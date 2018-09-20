const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class QuoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'quote',
      usage: '<message ID> [channel]',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const messageID = context.args[0];
    if (Number.isNaN(parseInt(messageID))) return context.replyError(context.__('quote.noMessageID'));

    const search = context.args.slice(1).join(' ');
    let { channel } = context.message;
    if (search && context.message.guild) {
      const foundChannels = this.client.finder.findRolesOrChannels(context.message.guild.channels, search);
      if (!foundChannels || foundChannels.length === 0 || !foundChannels[0]) return context.replyError(context.__('finderUtil.findChannels.zeroResult', { search }));
      if (foundChannels.length === 1) channel = foundChannels[0];
      else if (foundChannels.length > 1) return context.replyWarning(this.client.finder.formatChannels(foundChannels, context.settings.misc.locale));
    }

    if (channel.permissionsFor(this.client.user).missing(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY']).length > 0) {
      return context.replyWarning(context.__('quote.missingBotPermissions'));
    }

    if (channel.permissionsFor(context.message.author).missing(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY']).length > 0) {
      return context.replyWarning(context.__('quote.missingUserPermissions'));
    }

    channel.fetchMessage(messageID)
      .then(async (message) => {
        const memberColor = await context.message.guild.fetchMember(message.author.id)
          .then(m => m.displayHexColor === '#000000' ? null : m.displayHexColor)
          .catch(() => null);

        const embed = new RichEmbed()
          .setAuthor(message.author.tag, message.author.avatar
            ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.${message.author.avatar.startsWith('a_') ? 'gif' : 'png'}`
            : this.getDefaultAvatar(message.author.discriminator))
          .setDescription(message.content)
          .setFooter(`${channel.type === 'text' ? `#${channel.name}` : context.__('global.dm')} - ${message.editedTimestamp ? context.__('quote.edited') : context.__('quote.created')}`)
          .setTimestamp(message.editedAt || message.createdAt);
        if (memberColor) embed.setColor(memberColor);

        context.reply({ embed });
      })
      .catch(() => {
        context.replyWarning(context.__('quote.notFound', {
          channel: channel.type === 'text' ? `#${channel.name}` : context.__('global.dm'),
          message: messageID,
        }));
      });
  }

  getDefaultAvatar(discriminator) {
    const defaultAvatarID = discriminator % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarID}.png`;
  }
}

module.exports = QuoteCommand;
