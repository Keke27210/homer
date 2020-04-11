const Event = require('../structures/Event');

class ShardResumedEvent extends Event {
  constructor(client) {
    super(client, 'shardResumed');
  }

  async handle(id, replayedEvents) {
    this.client.logger.debug(`[shard ${id}] Resumed - Replayed ${replayedEvents} events`);
  }
}

module.exports = ShardResumedEvent;
