const Event = require('../structures/Event');

class ResumeEvent extends Event {
  constructor(client) {
    super(client, 'resume');
  }

  handle(replayed) {
    this.client.logger.warn(`Resumed - Replayed ${replayed} events.`);

    if (this.client.debug) {
      this.client.shard.send({
        type: 'log',
        message: `RESUMED - Replayed ${replayed} events`,
      });
    }
  }
}

module.exports = ResumeEvent;
