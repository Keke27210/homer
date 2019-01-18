const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class SuggestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'suggest',
      aliases: ['feedback'],
      category: 'bot',
      children: [new AnswerSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    const text = context.args.join(' ');
    if (text.length < 32) return context.replyError(context.__('suggest.textTooShort'));

    const caseID = `${Date.now()}_${context.message.author.id}`;
    await this.client.database.insertDocument('suggestions', {
      id: caseID,
      author: context.message.author.id,
      channel: context.message.channel.id,
      guild: context.message.guild ? context.message.guild.id : null,
      message: text,
      answer: null,
      time: Date.now(),
    });

    context.replySuccess(context.__('suggest.sent'));

    // Sending the message in a log channel
    this.client.sendMessage(
      this.client.constants.suggestionsChannel,
      `\`[${context.formatDate(Date.now(), 'HH:mm:ss')}]\` 🗨 Suggestion from **${context.message.author.username}**#${context.message.author.discriminator}:`,
      { embed: { description: text, footer: { text: `Case ID: ${caseID}` } } },
    );
  }
}

class AnswerSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'answer',
      category: 'bot',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const id = context.args[0];
    if (!id) return context.replyError('You must provide a suggestion ID to answer to.');

    const suggestion = await this.client.database.getDocument('suggestions', id);
    if (!suggestion) return context.replyError(`No suggestion found with ID \`${id}\``);

    const text = context.args.slice(1).join(' ');
    if (text.length > 1024) return context.replyWarning('The text length must be fewer than 1024 characters.');

    await this.client.database.updateDocument('suggestions', suggestion.id, { answer: text });

    const user = this.client.users.get(suggestion.author);
    const lang = await this.client.database.getDocument('settings', user.id).then(s => s ? s.misc.locale : this.client.localization.defaultLocale);
    if (user) {
      const embed = new RichEmbed()
        .setDescription(text)
        .setTimestamp(new Date())
        .setFooter(this.client.__(lang, 'suggest.answer.footer'));
      user.send(this.client.__(lang, 'suggest.answer.main'), { embed });
      context.replySuccess('Successfully replied to the suggestion\'s author.');
    } else {
      context.replyWarning('Couldn\'t send the message to the suggestion\'s author.');
    }
  }
}

module.exports = SuggestCommand;
