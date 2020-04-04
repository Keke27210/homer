const Event = require('../structures/Event');

class InvalidatedEvent extends Event {
  constructor(client) {
    super(client, 'invalidated');
  }

  handle() {
    this.client.logger.warn('[discord] Invalidated session, shutting down...');
    this.client.shutdown();
  }
}

module.exports = InvalidatedEvent;
