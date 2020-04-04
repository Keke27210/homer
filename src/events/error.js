const Event = require('../structures/Event');

class ErrorEvent extends Event {
  constructor(client) {
    super(client, 'error');
  }

  handle(error) {
    this.client.logger.error('[discord] Client error', error);
  }
}

module.exports = ErrorEvent;
