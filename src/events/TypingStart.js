const Event = require('../structures/Event');

class TypingStartEvent extends Event {
  constructor(client) {
    super(client, 'typingStart');
  }

  async handle(channel, user) {
    if (user.id !== this.client.user.id) {
      const calls = await this.client.database.getDocuments('calls', true);
      const call = calls.find(c => c.type === 0 ? [c.sender.id, c.receiver.id].includes(channel.id) : c.receivers.find(r => r.id === channel.id));
      if (!call) return;

      if (call.type === 0) {
        const destination = channel.id === call.sender.id ? 'receiver' : 'sender';
        this.client.rest.methods.sendTyping(call[destination].id);
      }
    }
  }
}

module.exports = TypingStartEvent;
