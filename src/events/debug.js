const Event = require('../structures/Event');

class DebugEvent extends Event {
  constructor(client) {
    super(client, 'debug');
  }

  handle(debug) {
    this.client.logger.debug(debug);
  }
}

module.exports = DebugEvent;
