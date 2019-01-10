const Command = require('../../structures/Command');
//const nodeXls = new (require('node-xls'));
const { RichEmbed } = require('discord.js');
const { appendFileSync, unlinkSync } = require('fs');
const wait = require('util').promisify(setTimeout);
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

    const none = context.__('global.none');
    const archiveInformation = [
      `${this.dot} ${context.__('archive.embed.requester')}: **${context.message.author.username}**#${context.message.author.discriminator}`,
      `${this.dot} ${context.__('archive.embed.date')}: **${context.formatDate()}**`,
      `${this.dot} ${context.__('archive.embed.download')}: ${none}`,
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
        let ok = true;

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
            
          if (messages.size === 0) return message.edit(`${this.client.constants.emotes.warning} ${context.__('archive.noMessageDumped')}`);

          if (emote === this.emotes[0]) {
            const name = `archive_${channel.id}_${startTime}.txt`;

            // Dumping messages and storing them in a temp txt file
            appendFileSync(`./tmp/${name}`, [
              `=== ARCHIVE FROM #${channel.name} (ID:${channel.id}) ===`,
              `CHANNEL CREATION: ${context.formatDate(channel.createdTimestamp)}`,
              `ARCHIVE REQUESTED BY: ${context.message.author.tag} (ID:${context.message.author.id})`,
              `DUMP DATE: ${context.formatDate()}`,
              '',
              '=== MESSAGES ===\r\n',
            ].join('\r\n'));

            (async function () {
              let loops = 0;
              let finished = false;
              let lastMessageID = null;
              while (!finished && loops < 500) {
                loops += 1;
                const fetched = await channel.fetchMessages({ limit: 100, before: lastMessageID })
                  .then(m => m.filter(me => me.content));
                await wait(250);
                appendFileSync(`./tmp/${name}`, fetched.map(m => `[${context.formatDate(m.createdTimestamp)}] ${m.author.tag} (ID:${m.author.id}): ${m.cleanContent}`).join('\r\n'));
                lastMessageID = fetched.last().id;
                if (fetched.size < 100) finished = true;
              }
            })()
              .catch(() => {
                message.edit(`${this.client.constants.emotes.error} ${context.__('archive.error')}`);
                ok = false;
              });

            if (!ok) return;
            appendFileSync(`./tmp/${name}`, [
              '',
              '=== END OF MESSAGES ===',
            ].join('\r\n'));
            // Dumper end
            
            const link = await request
              .post('https://file.io')
              .set('Content-Type', 'multipart/form-data')
              .attach('file', `./tmp/${name}`, { filename: name, contentType: 'application/octet-stream' })
              .then(r => r.body.link)
              .catch(() => null);

            const newEmbed = new RichEmbed(message.embeds[0])
              .setDescription(message.embeds[0].description.replace(none, `**<${link}>**`));
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
