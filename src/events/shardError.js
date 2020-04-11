const Event = require('../structures/Event');

class ShardErrorEvent extends Event {
  constructor(client) {
    super(client, 'shardError');
  }

  async handle(error, id) {
    this.client.logger.error(`[shard ${id}] WebSocket encountered an error`, error);
  }
}

module.exports = ShardErrorEvent;
