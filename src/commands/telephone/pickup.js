const Command = require('../../structures/Command');

class PickupCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pickup',
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const callObject = await this.client.database.getDocuments('calls', true)
      .then(calls => calls.find(c => [c.sender.id, c.receiver.id].includes(context.message.channel.id)));
    if (!callObject) return context.replyError(context.__('telephone.noCall'));
    if (callObject.receiver.id !== context.message.channel.id) return context.replyError(context.__('pickup.senderCannotPickup'));
    if (callObject.state === 1) return context.replyWarning(context.__('pickup.alreadyAnswered'));

    this.client.database.updateDocument('calls', callObject.id, { state: 1 });
    this.client.sendMessage(callObject.sender.id, this.client.__(callObject.sender.locale, 'pickup.sender'));
    this.client.sendMessage(callObject.receiver.id, this.client.__(callObject.receiver.locale, 'pickup.receiver'));
  }
}

module.exports = PickupCommand;
