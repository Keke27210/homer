const Routine = require('../structures/Routine');

class JobsRoutine extends Routine {
  constructor(client) {
    super(client);
  }

  async handle() {
    const calls = await this.client.database.getDocuments('calls', true);

    // Inactive phone calls
    if (this.client.shard.id === 0) {
      const inactiveCalls = calls.filter(c => (Date.now() - c.active) > 300000);

      for (const call of inactiveCalls) {
        this.client.database.deleteDocument('calls', call.id);
        calls.splice(calls.indexOf(call), 1);

        if (call.type === 0) {
          this.client.sendMessage(call.sender.id, this.client.__(call.sender.locale, 'telephone.inactive'));
          this.client.sendMessage(call.receiver.id, this.client.__(call.receiver.locale, 'telephone.inactive'));
        } else {
          for (const recv of call.receivers) this.client.sendMessage(recv.id, this.client.__(recv.locale, 'telephone.inactiveGroup'));
        }
      }
    }

    // Call timeout
    if (this.client.shard.id === 0) {
      for (const call of calls) {
        if (call.type === 0 && call.state === 0 && (Date.now() - call.start) > 30000) {
          // Sender
          const senderContact = call.sender.contacts.find(c => c.number === call.receiver.number);
          const senderIdentity = senderContact ? `**${senderContact.description}** (**${senderContact.number}**)` : `**${call.receiver.number}**`;
          let senderMsg = this.client.__(call.sender.locale, 'telephone.outgoingTimeout', { identity: senderIdentity });
          if (call.receiver.messages && call.receiver.messages.missed) senderMsg += `\n${call.receiver.messages.missed}`;

          this.client.updateMessage(call.sender.id, call.sender.message, senderMsg);

          // Receiver
          const receiverContact = call.receiver.contacts.find(c => c.number === call.sender.number);
          const receiverIdentity = receiverContact ? `**${receiverContact.description}** (**${receiverContact.number}**)` : `**${call.sender.number}**`;
          this.client.updateMessage(call.receiver.id, call.receiver.message, this.client.__(call.receiver.locale, 'telephone.incomingTimeout', { identity: receiverIdentity }));

          this.client.database.deleteDocument('calls', call.id);
        } else if (call.type === 1 && (Date.now() - call.start) > 30000) {
          const main = call.receivers.find(r => r.main);
          for (const receiver of call.receivers) {
            if (receiver.main) continue;

            if ((Date.now() - receiver.start) > 30000 && receiver.state === 0) {
              call.receivers.splice(call.receivers.indexOf(receiver), 1);

              // Main
              const mainContact = main.contacts.find(c => c.number === receiver.number);
              const mainIdentity = mainContact ? `**${mainContact.description}** (\`${mainContact.number}\`)` : `\`${receiver.number}\``;
              let mainMsg = this.client.__(main.locale, 'telephone.outgoingGroupTimeout', { identity: mainIdentity });
              if (receiver.messages && receiver.messages.missed) mainMsg += `\n${receiver.messages.missed}`;
      
              this.client.sendMessage(
                main.id,
                mainMsg,
              );

              // Receiver
              const receiverContact = receiver.contacts.find(c => c.number === main.number);
              const receiverIdentity = receiverContact ? `**${receiverContact.description}** (\`${receiverContact.number}\`)` : `\`${main.number}\``;
              this.client.updateMessage(
                receiver.id,
                receiver.message,
                this.client.__(receiver.locale, 'telephone.incomingGroupTimeout', { identity: receiverIdentity }),
              );
            }

            if (call.receivers.length === 1) {
              this.client.sendMessage(main.id, this.client.__(main.locale, 'telephone.emptyGroup'));
              this.client.database.deleteDocument('calls', call.id);
            } else {
              this.client.database.insertDocument('calls', call, { conflict: 'update' });
            }
          }
        }
      }
    }
  }
}

module.exports = JobsRoutine;
