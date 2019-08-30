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
    if (!subscription.textable) return context.replyWarning(context.__('telephone.text.mustEnable'));

    const number = context.args[0] ? context.args[0].trim().toUpperCase() : null;
    const text = context.args.slice(1).join(' ');
    if (!number) return context.replyError(context.__('text.noNumber'));
    if (number === subscription.number) return context.replyWarning(context.__('text.cannotTextYourself'));
    if (!text) return context.replyError(context.__('text.noText'));
    if (text.length > 256) return context.replyWarning(context.__('text.textTooLong'));

    const status = await this.client.database.getDocument('bot', 'settings').then(s => s.telephone);
    const toSend = await this.client.database.findDocuments('telephone', { number }).then(a => a[0]);
    if (!toSend) return context.replyWarning(context.__('telephone.unassignedNumber', { number }));
    if (toSend.blacklist.find(b => b.channel === context.message.channel.id) || !status || !toSend.textable) {
      return context.replyWarning(context.__('text.cannotSend'));
    }

    this.client.telephone.addHistory(
      subscription.id,
      'TEXT_SENT',
      context.message.author.id,
      [toSend.number],
    );

    this.client.telephone.addHistory(
      toSend.id,
      'TEXT_RECEIVED',
      context.message.author.id,
      [subscription.number],
    );

    const toLang = await this.client.database.getDocument('settings', toSend.settings)
      .then(s => s ? s.misc.locale : null);
    this.client.sendMessage(
      toSend.id,
      this.client.__(toLang, 'text.title', {
        user: `**${context.message.author.username}**#${context.message.author.discriminator}`,
        identity: toSend.contacts.find(c => c.number === subscription.number) ?
        `**${toSend.contacts.find(c => c.number === subscription.number).description}** (**${subscription.number}**)` :
        `**${subscription.number}**`,
      }),
      {
        embed: {
          description: text,
          footer: { text: this.client.__(toLang, 'text.footer', { command: `${this.client.prefix}text ${subscription.number} <message>`}) },
        },
      }
    );

    context.replySuccess(context.__('text.sent', {
      identity: subscription.contacts.find(c => c.number === number) ?
        `**${subscription.contacts.find(c => c.number === number).description}** (**${number}**)` :
        `**${number}**`,
    }));
  }
}

module.exports = TextCommand;
