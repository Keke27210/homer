const Event = require('../structures/Event');

class ShardReadyEvent extends Event {
  constructor(client) {
    super(client, 'shardReady');
  }

  async handle(id, unavailableGuilds) {
    await this.client.updatePresence(id);
    this.client.logger.log(`[shard ${id}] Ready - Unavailable guilds: ${unavailableGuilds ? unavailableGuilds.values().join(' - ') : 'None'}`);
  }
}

module.exports = ShardReadyEvent;
