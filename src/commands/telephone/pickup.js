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
    const calls = await this.client.database.getDocuments('calls', true);

    const call = calls.find(c => c.type === 0 ? [c.sender.id, c.receiver.id].includes(context.message.channel.id) : c.receivers.find(r => r.id === context.message.channel.id));
    if (!call) return context.replyError(context.__('telephone.noCommunication'));
    if (call.state === 1) return context.replyWarning(context.__('pickup.notPending'));

    if (call.type === 0) {
      if (call.receiver.id !== context.message.channel.id) return context.replyError(context.__('pickup.senderPickup'));
      this.client.database.updateDocument('calls', call.id, { state: 1 });
      this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'pickup.sender'));
      this.client.sendMessage(call.receiver.id, this.client.__(call.receiver.locale, 'pickup.receiver'));
    }
  }
}

module.exports = PickupCommand;
