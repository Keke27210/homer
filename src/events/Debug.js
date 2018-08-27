const Event = require('../structures/Event');

class DebugEvent extends Event {
  constructor(client) {
    super(client, 'debug');
  }

  handle(debug) {
    if (!this.client.debug) return;
    this.client.shard.send({
      type: 'log',
      message: `DEBUG: ${debug}`,
    });
  }
}

module.exports = DebugEvent;
