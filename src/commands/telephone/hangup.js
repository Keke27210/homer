const Command = require('../../structures/Command');

class HangupCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hangup',
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const callObject = await this.client.database.getDocuments('calls', true)
      .then(calls => calls.find(c => [c.sender.id, c.receiver.id].includes(context.message.channel.id)));
    if (!callObject) return context.replyError(context.__('telephone.noCall'));
    const state = (context.message.channel.id === callObject.sender.id) ? 'sender' : 'receiver';

    this.client.database.deleteDocument('calls', callObject.id);
    if (callObject.state === 1) {
      if (state === 'sender') {
        this.client.sendMessage(callObject.sender.id, this.client.__(callObject.sender.locale, 'hangup.author'));
        this.client.sendMessage(callObject.receiver.id, this.client.__(callObject.receiver.locale, 'hangup.target'));
      } else {
        this.client.sendMessage(callObject.sender.id, this.client.__(callObject.sender.locale, 'hangup.target'));
        this.client.sendMessage(callObject.receiver.id, this.client.__(callObject.receiver.locale, 'hangup.author'));
      }
    } else if (state === 'sender') {
      this.client.sendMessage(callObject.sender.id, this.client.__(callObject.sender.locale, 'hangup.author'));
      this.client.updateMessage(callObject.receiver.id, callObject.receiverMessage, this.client.__(callObject.receiver.locale, 'call.receiverMissed', { number: callObject.sender.number }));
    } else {
      this.client.sendMessage(callObject.sender.id, this.client.__(callObject.sender.locale, 'hangup.target'));
      this.client.sendMessage(callObject.receiver.id, this.client.__(callObject.receiver.locale, 'hangup.author'));
    }
  }
}

module.exports = HangupCommand;
