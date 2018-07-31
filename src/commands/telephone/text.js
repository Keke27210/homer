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
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) {
      return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));
    }

    const number = context.args[0];
    const text = context.args.slice(1).join(' ');
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
        number: subscription.number,
      }),
      {
        embed: {
          description: text,
          footer: { text: context.__('text.footer', { command: `${this.client.prefix}text ${subscription.number} <message>`}) },
        },
      }
    );

    context.replySuccess(context.__('text.sent', { number }));
  }
}

module.exports = TextCommand;
