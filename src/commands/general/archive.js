const Command = require('../../structures/Command');
//const nodeXls = new (require('node-xls'));
const { RichEmbed } = require('discord.js');
const { writeFileSync, unlinkSync, createReadStream } = require('fs');
const request = require('superagent');

class ArchiveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'archive',
      category: 'general',
      usage: '<channel>',
      userPermissions: ['MANAGE_CHANNELS'],
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
      `${this.dot} ${context.__('archive.embed.requester')}: **${context.message.author.username}**#${context.message.author.discriminator}`,
      `${this.dot} ${context.__('archive.embed.date')}: **${context.formatDate()}**`,
      '',
      context.__('archive.embed.instructions', { error: this.client.constants.emotes.error }),
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(archiveInformation)
      .setFooter(context.__('archive.embed.footer'));
    const message = await context.reply(context.__('archive.main', { channel: `#${channel.name}` }), { embed });
    (async () => {
      for (const emote of this.emotes) await message.react(emote);
    })();

    message.awaitReactions(
      (reaction, user) => (this.emotes.includes(reaction.emoji.name) || this.emotes.includes(reaction.emoji.identifier)) && user.id === context.message.author.id,
      { max: 1 },
    )
      .then(async (reactions) => {
        const emote = reactions.first().emoji.identifier;

        // Text format
        if (emote === this.emotes[0]) {
          const entry = await this.client.database.findDocuments('archives', { guild: context.message.guild.id }, true)
            .then(entries => entries.filter(e => (Date.now() - e.time) < 3600000));
          if (entry.length > 0) return message.edit(`${this.client.constants.emotes.error} ${context.__('archive.calmDown')}`);

          const startTime = Date.now();
          this.client.database.insertDocument('archives', {
            guild: context.message.guild.id,
            channel: context.message.channel.id,
            executor: context.message.author.id,
            time: startTime,
          });

          message.edit(`${this.client.constants.emotes.loading} ${context.__('archive.dumpInProgress')}`);
          const messages = await this.client.other.archiveChannel(channel.id)
            .then(me => me.filter(m => m.content))
            .catch(() => {
              message.edit(`${this.client.constants.emotes.error} ${context.__('archive.error')}`);
            });
          if (messages.size === 0) return message.edit(`${this.client.constants.emotes.warning} ${context.__('archive.noMessageDumped')}`);

          const list = messages
            .filter(m => m.cleanContent)
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            .map(m => `[${context.formatDate(m.createdTimestamp)}] ${m.author.tag} (ID:${m.author.id}): ${m.content}`)
            .join('\r\n');

          if (emote === this.emotes[0]) {
            const string = ([
              `=== ARCHIVE FROM #${channel.name} (ID:${channel.id}) ===`,
              `CHANNEL CREATION: ${context.formatDate(channel.createdTimestamp)}`,
              `ARCHIVE REQUESTED BY: ${context.message.author.tag} (ID:${context.message.author.id})`,
              `DUMP DATE: ${context.formatDate()}`,
              '',
              '=== MESSAGES ===',
              list,
              '',
              '=== END OF MESSAGES ===',
              `TOTAL COUNT: ${messages.size}`,
            ].join('\r\n'));

            const buffer = Buffer.from(string);
            const name = `archive_${channel.id}_${startTime}.txt`;
            writeFileSync(`./tmp/${name}`, buffer, { encoding: 'utf8' });

            const response = await request
              .post('https://file.io')
              .set('Content-Type', 'multipart/form-data')
              .attach('file', `./tmp/${name}`, { filename: name, contentType: 'plain/text' })
              .then(r => typeof r.body === 'object' ? r.body.key : null)
              .catch(() => null);

            const newEmbed = new RichEmbed(message.embeds[0])
              .setDescription(message.embeds[0].description += `\n\n${this.dot} ${context.__('archive.download')}: **<https://file.io/${response}>**`);
            message.edit(message.content, { embed: newEmbed });
            unlinkSync(`./tmp/${name}`);
          }

          message.edit(`${this.client.constants.emotes.success} ${context.__('archive.success', { count: messages.size })}`);
        }

        // Cancel
        else {
          message.edit(`${this.client.constants.emotes.warning} ${context.__('archive.cancelled')}`);
        }
      });
  }

  get emotes() {
    return [
      '%F0%9F%93%84',
      //'📊',
      this.client.constants.emotes.errorID,
    ];
  }
}

module.exports = ArchiveCommand;
