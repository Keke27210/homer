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

    const call = calls.find(c => c.type === 0 ? [c.sender.id, c.receiver.id].includes(context.message.channel.id) : c.receivers.find(r => r.id === context.message.channel.id));
    if (!call) return context.replyError(context.__('telephone.noCommunication'));

    if (call.type === 0) {
      this.client.database.deleteDocument('calls', call.id);
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

        const contact = call.receiver.contacts.find(c => c.number === call.sender.number);
        this.client.updateMessage(
          call.receiver.id,
          call.receiver.message,
          this.client.__(call.receiver.locale, 'telephone.incomingTimeout', { identity: contact ? `**${contact.description}** (**${contact.number}**)` : `**${call.sender.number}**` }),
        );
      } else {
        this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'hangup.target'));
        this.client.sendMessage(call.receiver.id, this.client.__(call.receiver.locale, 'hangup.author'));
      }
    } else {
      const receiver = call.receivers.find(r => r.id === context.message.channel.id);
      if (receiver.main) {
        for (const r of call.receivers.filter(r => !r.main && r.state !== 0)) this.client.sendMessage(r.id, this.client.__(r.locale, 'hangup.group.receivers'));
        context.reply(context.__('hangup.group.main'));
        this.client.database.deleteDocument('calls', call.id);
      } else {
        const destinations = call.receivers.filter(r => r.id !== context.message.channel.id && r.state !== 0);
        for (const dest of destinations) {
          const contact = dest.contacts.find(c => c.number === receiver.number);
          const identity = contact ? `**${contact.description}** (\`${contact.number}\`)` : `\`${receiver.number}\``;

          this.client.sendMessage(
            dest.id,
            this.client.__(dest.locale, 'hangup.group.receiver', { identity }),
          );
        }

        call.receivers.splice(call.receivers.findIndex(c => c.id === context.message.channel.id), 1);
        context.reply(context.__('hangup.author'));
        if (call.receivers.length === 1) {
          this.client.sendMessage(destinations[0].id, this.client.__(destinations[0].locale, 'telephone.emptyGroup'));
          this.client.database.deleteDocument('calls', call.id);
        } else {
          this.client.database.updateDocument('calls', call.id, { receivers: call.receivers });
        }
      }
    }
  }
}

module.exports = HangupCommand;
