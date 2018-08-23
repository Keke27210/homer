const Command = require('../../structures/Command');

class CallCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'call',
      aliases: ['dial'],
      category: 'telephone',
      usage: '<number>',
      dm: true,
    });
  }

  async execute(context) {
    const status = await this.client.database.getDocument('bot', 'settings').then(s => s.telephone);
    const calls = await this.client.database.getDocuments('calls', true);

    const thisSubscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!thisSubscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    if (calls.find(c => c.sender.number === thisSubscription.number || c.receiver.number === thisSubscription.number)) {
      return context.replyWarning(context.__('call.callerBusy'));
    }

    const number = context.args[0];
    if (!number) return context.replyError(context.__('call.noNumber'));

    if (thisSubscription.number === number) return context.replyWarning(context.__('call.cannotCallOwn'));

    const toSubscription = await this.client.database.findDocuments('telephone', { number }).then(r => r[0]);
    if (!toSubscription) return context.replyWarning(context.__('telephone.notAssigned', { number }));
    if (toSubscription.blacklist.find(b => b.channel === context.message.channel.id) || !status) {
      return context.replyWarning(context.__('telephone.refusedConnection'));
    }

    if (calls.find(c => c.sender.number === number || c.receiver.number === number)) {
      return context.replyWarning(context.__('call.receiverBusy'));
    }

    const toLanguage = (await this.client.database.getDocument('settings', toSubscription.settings) || this.client.constants.defaultUserSettings(toSubscription.settings)).misc.locale;
    const thisMessage = await context.reply(context.__('call.calling', { number }));
    const toMessage = await this.client.sendMessage(
      toSubscription.id,
      `${this.client.__(toLanguage, 'call.incomingCall', { command: `${this.client.prefix}pickup`, number: thisSubscription.number })}${toSubscription.message.incoming ? `\n${toSubscription.message.incoming}` : ''}`,
    );

    thisSubscription.locale = context.settings.misc.locale;
    toSubscription.locale = toLanguage;
    await this.client.database.insertDocument(
      'calls',
      {
        sender: thisSubscription,
        receiver: toSubscription,
        senderMessage: thisMessage.id,
        receiverMessage: toMessage.id,
        state: 0,
        time: Date.now(),
      },
      {
        conflict: 'update',
      },
    );

    this.client.setTimeout(async () => {
      const callObject = await this.client.database.getDocuments('calls', true)
        .then(calls => calls.find(c => c.sender.number === thisSubscription.number && c.receiver.number === toSubscription.number));
      if (!callObject || callObject.state !== 0) return;

      this.client.database.deleteDocument('calls', callObject.id);
      this.client.updateMessage(
        callObject.sender.id,
        callObject.senderMessage,
        `${context.__('call.senderMissed', { number })}${callObject.receiver.message.missed ? `\n${callObject.receiver.message.missed}` : ''}`,
      );

      this.client.updateMessage(
        callObject.receiver.id,
        callObject.receiverMessage,
        `${this.client.__(toLanguage, 'call.receiverMissed', { number: callObject.sender.number })}`,
      );
    }, 30000);
  }
}

module.exports = CallCommand;
