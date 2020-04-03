const Event = require('../structures/Event');

class ReadyEvent extends Event {
  constructor(client) {
    super(client, 'ready');
  }

  handle() {
    this.client.logger.info(`[ready] Bot initialized successfully - Serving as ${this.client.user.tag}`);
  }
}

module.exports = ReadyEvent;
