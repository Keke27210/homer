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

        const contact = call.receiver.contacts.find(c => c.number === call.sender.number);
        this.client.updateMessage(
          call.receiver.id,
          call.receiver.message,
          this.client.__(call.receiver.locale, 'telephone.incomingTimeout', { identity: contact ? `**${contact.description}** (**${contact.number}**)` : `**${contact.number}**` }),
        );
      } else {
        this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'hangup.target'));
        this.client.sendMessage(call.receiver.id, this.client.__(call.receiver.locale, 'hangup.author'));
      }
    } else {
      this.client.database.deleteDocument('calls', call.id);

      const receiver = call.receivers.find(r => r.id === context.message.channel.id);
      if (receiver.main) {
        for (const r of call.receivers.filter(r => !r.main)) this.client.sendMessage(r.id, this.client.__(r.locale, 'hangup.group.receivers'));
        context.reply(context.__('hangup.group.main'));
      } else {
        const destinations = call.receivers.filter(r => r.id !== context.message.channel.id);
        for (const dest of destinations) {
          const contact = dest.contacts.find(c => c.number === receiver.number);
          const identity = contact ? `**${contact.description}** (\`${contact.number}\`)` : `\`${receiver.number}\``;

          this.client.sendMessage(
            dest.id,
            this.client.__(dest.locale, 'hangup.receiver', { identity }),
          );
        }

        context.reply(context.__('hangup.author'));
        this.client.database.updateDocument('calls', { receivers: destinations });
      }
    }
  }
}

module.exports = HangupCommand;
