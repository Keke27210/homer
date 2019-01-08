const Event = require('../structures/Event');

class ReconnectingEvent extends Event {
  constructor(client) {
    super(client, 'reconnecting');
  }

  handle() {
    this.client.logger.warn(`Reconnecting...`);

    if (this.client.debug) {
      this.client.shard.send({
        type: 'log',
        message: `Reconnecting to Discord API...`,
      });
    }
  }
}

module.exports = ReconnectingEvent;
