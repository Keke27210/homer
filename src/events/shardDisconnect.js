const Event = require('../structures/Event');

class ShardDisconnectEvent extends Event {
  constructor(client) {
    super(client, 'shardError');
  }

  async handle(code, id) {
    this.client.logger.log(`[shard ${id}] Disconnected with WS close code ${code}`);
  }
}

module.exports = ShardDisconnectEvent;
