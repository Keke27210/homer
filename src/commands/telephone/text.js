const Command = require('../../structures/Command');

class TextCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'text',
      aliases: ['sms'],
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const number = context.args[0];
    const text = context.message.cleanContent.split(/ +/g).slice(1).join(' ');
    if (!number) return context.replyError(context.__('text.noNumber'));
    if (!text) return context.replyError(context.__('text.noText'));
    if (text.length > 256) return context.replyWarning(context.__('text.textTooLong'));

    const status = await this.client.database.getDocument('bot', 'settings').then(s => s.telephone);
    const toSend = await this.client.database.findDocuments('telephone', { number }).then(a => a[0]);
    if (!toSend) return context.replyWarning(context.__('telephone.notAssigned', { number }));
    if (toSend.blacklist.find(b => b.channel === context.message.channel.id) || !status) {
      return context.replyWarning(context.__('text.cannotSend'));
    }

    this.client.sendMessage(
      toSend.id,
      context.__('text.title', {
        user: `**${context.message.author.username}**#${context.message.author.discriminator}`,
        number: toSend.number,
      }),
      {
        embed: {
          description: text,
          footer: { text: context.__('text.footer', { command: `${this.client.prefix}text ${number} <message>`}) },
        },
      }
    )
  }
}

module.exports = TextCommand;
