const Event = require('../structures/Event');

class MessageEvent extends Event {
  constructor(client) {
    super(client, 'message');
  }

  handle(message) {
    if (!this.client.ready) return;

    this.client.commandManager.handleMessage(message);
    this.client.telephone.calls.handleMessage(message);
    this.client.tracking.updateActivity(message.author.id);
  }
}

module.exports = MessageEvent;
