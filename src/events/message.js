const Event = require('../structures/Event');

class MessageEvent extends Event {
  constructor(client) {
    super(client, 'message');
  }

  handle(message) {
    this.client.commandManager.handleMessage(message);
    this.client.telephone.callManager.handleMessage(message);
  }
}

module.exports = MessageEvent;
