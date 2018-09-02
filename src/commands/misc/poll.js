const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class PollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'poll',
      usage: '<title> [options]',
      botPermissions: ['ADD_REACTIONS'],
      category: 'misc',
    });
  }

  async execute(context) {
    const [title, options] = context.parseOptions();
    if (!title) return context.replyError(context.__('poll.noTitle'));
    if (title.length > 64) return context.replyWarning(context.__('poll.titleTooLong'));

    let duration = 60000;
    let description = null;
    let color = null;
    let strict = false;
    let emotes = [];

    for (const option of options) {
      if (option.name === 't') {
        const parsedDuration = this.client.time.parseDuration(option.value, context.settings.misc.locale);
        if (parsedDuration > 60000) duration = parsedDuration;
      } else if (option.name === 'd') {
        description = option.value;
      } else if (option.name === 's') {
        strict = true;
      } else if (option.name === 'c') {
        if (typeof option.value === 'string') color = option.value.toUpperCase();
      } else if (option.name === 'e') {
        const customEmotes = option.value.split(/ +/g);
        if (customEmotes.length >= 2) {
          for (const customEmote of customEmotes) {
            const customTest = /<a?:(.*):(\d{17,20})>/g.exec(customEmote);
            if (!customTest) emotes.push(customEmote);
            else {
              const foundEmote = await this.client.finder.findEmojis(customTest[2]).then(e => e[0]);
              if (foundEmote) emotes.push(`${foundEmote.name}:${foundEmote.id}`);
            }
          }
        }
      }
    }
    if (emotes.length < 2) emotes = ['👍', '👎'];

    const start = Date.now();
    const end = (start + duration);
    const id = (Math.random().toFixed(4).toString().substring(2));

    const embed = new RichEmbed()
      .setTitle(title)
      .setFooter(context.__('poll.footer'))
      .setTimestamp(new Date(end));

    if (description) embed.setDescription(description);
    if (color) embed.setColor(color);

    const msg = await context.reply({ embed });
    for (const emote of emotes) await msg.react(emote);

    await this.client.database.insertDocument(
      'jobs',
      {
        id,
        start,
        duration,
        end,
        type: 'poll',
        guild: context.message.guild.id,
        title,
        emotes,
        strict,
        messageID: msg.id,
        channelID: context.message.channel.id,
        color: embed.hexColor || '#000000',
      },
    );
  }
}

module.exports = PollCommand;
