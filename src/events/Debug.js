const Event = require('../structures/Event');

class DebugEvent extends Event {
  constructor(client) {
    super(client, 'debug');
  }

  handle(debug) {
    this.client.shard.send({
      type: 'log',
      message: `DEBUG: ${debug}`,
    });
  }
}

module.exports = DebugEvent;
