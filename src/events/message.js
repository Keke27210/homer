const Event = require('../structures/Event');

class MessageEvent extends Event {
  constructor(client) {
    super(client, 'message');
  }

  handle(message) {
    this.client.commandManager.handleMessage(message);
    this.client.telephone.calls.handleMessage(message);
  }
}

module.exports = MessageEvent;
