const Event = require('../structures/Event');

class MessageEvent extends Event {
  constructor(client) {
    super(client, 'message');
  }

  handle(message) {
    if (this.client.database.ready) {
      this.client.tracking.updateActivity(message.author.id);
    }

    this.client.commandManager.handleMessage(message);
    this.client.telephone.calls.handleMessage(message);
  }
}

module.exports = MessageEvent;
