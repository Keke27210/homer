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
    const calls = await this.client.database.getDocuments('calls', true);
    if (!calls) return context.replyError(context.__('telephone.noCall'));

    const call = calls.find(c => c.type === 0 ? [c.sender.id, c.receiver.id].includes(context.message.channel.id) : c.receivers.find(r => r.id === context.message.channel.id));
    await this.client.database.deleteDocument('calls', call.id);    

    if (call.type === 0) {
      const state = (context.message.channel.id === call.sender.id) ? 'sender' : 'receiver';
      if (call.state === 1) {
        if (state === 'sender') {
          this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'hangup.author'));
          this.client.sendMessage(call.receiver.id, this.client.__(call.receiver.locale, 'hangup.target'));
        } else {
          this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'hangup.target'));
          this.client.sendMessage(call.receiver.id, this.client.__(call.receiver.locale, 'hangup.author'));
        }
      } else if (state === 'sender') {
        this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'hangup.author'));

        const contact = receiver.contacts.find(c => c.number === c.sender.number);
        this.client.updateMessage(
          call.receiver.id,
          call.receiver.message,
          this.client.__(call.receiver.locale, 'telephone.incomingTimeout', { identity: contact ? `**${contact.description}** (**${contact.number}**)` : `**${contact.number}**` }),
        );
      } else {
        this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'hangup.target'));
        this.client.sendMessage(call.receiver.id, this.client.__(call.receiver.locale, 'hangup.author'));
      }
    }
  }
}

module.exports = HangupCommand;
