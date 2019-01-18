const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class ReportCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'report',
      aliases: ['flag'],
      category: 'bot',
      children: [new AnswerSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    const id = context.args[0];
    if (!id) return context.replyError(context.__('report.noID'));

    const user = await this.client.fetchUser(id).catch(() => null);
    if (!user) return context.replyWarning(context.__('report.unknownUser', { id }));

    const text = context.args.join(' ');
    if (text.length < 32) return context.replyError(context.__('report.textTooShort'));

    const caseID = `${Date.now()}_${context.message.author.id}`;
    await this.client.database.insertDocument('reports', {
      id: caseID,
      author: context.message.author.id,
      channel: context.message.channel.id,
      guild: context.message.guild ? context.message.guild.id : null,
      flagged: user.id,
      message: text,
      answer: null,
      time: Date.now(),
    });

    context.replySuccess(context.__('report.sent'));

    // Sending the message in a log channel
    this.client.sendMessage(
      this.client.constants.reportsChannel,
      `\`[${context.formatDate(Date.now(), 'HH:mm:ss')}]\` Report from **${context.message.author.username}**#${context.message.author.discriminator} about **${user.username}**#${user.discriminator}:`,
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
    if (!id) return context.replyError('You must provide a report ID to answer to.');

    const report = await this.client.database.getDocument('reports', id);
    if (!report) return context.replyError(`No report found with ID \`${id}\``);

    const text = context.args.join(' ');
    if (text.length > 1024) return context.replyWarning('The text length must be fewer than 1024 characters.');

    await this.client.database.updateDocument('reports', report.id, { answer: text });

    const user = this.client.users.get(report.author);
    if (user) {
      const embed = new RichEmbed()
        .setDescription(text)
        .setTimestamp(new Date())
        .setFooter(context.__('report.answer.footer'));
      user.send(context.__('report.answer.main', { embed }));
      context.replySuccess('Successfully replied to the report\'s author.');
    } else {
      context.replyWarning('Couldn\'t send the message to the report\'s author.');
    }
  }
}

module.exports = ReportCommand;
