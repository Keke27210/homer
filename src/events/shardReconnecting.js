const Event = require('../structures/Event');

class ShardReconnectingEvent extends Event {
  constructor(client) {
    super(client, 'shardReconnecting');
  }

  async handle(id) {
    this.client.logger.debug(`[shard ${id}] Reconnecting...`);
  }
}

module.exports = ShardReconnectingEvent;
