const Command = require('../../structures/Command');
//const nodeXls = new (require('node-xls'));
const { Attachment, RichEmbed } = require('discord.js');

class ArchiveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'archive',
      category: 'general',
      usage: '<channel>',
      userPermissions: ['MANAGE_CHANNELS'],
      private: true,
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let { channel } = context.message;
    if (search) {
      const foundChannels = this.client.finder.findRolesOrChannels(context.message.guild.channels, search, true);
      if (!foundChannels || foundChannels.length === 0 || !foundChannels[0]) return context.replyError(context.__('finderUtil.findChannels.zeroResult', { search }));
      if (foundChannels.length === 1) channel = foundChannels[0];
      else if (foundChannels.length > 1) return context.replyWarning(this.client.finder.formatChannels(foundChannels, context.settings.misc.locale));
    }

    if (!channel.permissionsFor(context.message.author).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'])) {
      context.replyError(context.__('archive.permissionsUser'));
    }

    if (!channel.permissionsFor(this.client.user).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'])) {
      context.replyError(context.__('archive.permissionsBot'));
    }

    const archiveInformation = [
      `${this.dot} ${context.__('archive.embed.requester')}: **${context.message.author.username}**#${context.message.author.id}`,
      `${this.dot} ${context.__('archive.embed.date')}: **${context.formatDate()}**`,
      '',
      context.__('archive.embed.instructions'),
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(archiveInformation)
      .setFooter(context.__('archive.embed.footer'));
    const message = await context.reply(context.__('archive.main', { channel: `#${channel.name}` }), { embed });

    message.awaitReactions(
      (reaction, user) => this.emotes.includes(reaction.emoji.identifier) && user.id === context.message.author.id,
      { max: 1 },
    )
      .then((reactions) => {
        const emote = reactions.first().emoji.identifier;

        // Text format
        if (emote === this.emotes[0]) {
          message.edit(`${this.client.constants.emotes.loading} ${context.__('archive.dumpInProgress')}`);
          const messages = await this.client.other.archiveChannel(channel.id).then(me => me.filter(m => m.content));
          if (messages.size === 0) return message.edit(`${this.client.constants.emotes.warning} ${context.__('archive.noMessageDumped')}`);

          const list = messages
            .filter(m => m.cleanContent)
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            .map(m => `[${m.createdAt.toUTCString()}] ${m.author.tag} (ID:${m.author.id}): ${m.content}`)
            .join('\r\n');

          if (emote === this.emotes[0]) {
            const string = ([
              `=== ARCHIVE FROM #${channel.name} (ID:${channel.id}) ===`,
              `CHANNEL CREATION: ${channel.createdAt.toUTCString()}`,
              `ARCHIVE REQUESTED BY: ${context.message.author.tag} (ID:${context.message.author.id})`,
              '',
              '=== MESSAGES ===',
              list,
            ].join('\r\n'));

            context.reply({ files: [new Attachment(string, `dump.txt`)] });
          }

          message.edit(`${this.client.constants.emotes.warning} ${context.__('archive.success', { count: messages.size })}`);
        }

        // Cancel
        else {
          message.edit(`${this.client.constants.emotes.warning} ${context.__('archive.cancelled')}`);
        }
      });
  }

  get emotes() {
    return [
      '📄',
      //'📊',
      this.client.constants.emotes.errorID,
    ];
  }
}

module.exports = ArchiveCommand;
