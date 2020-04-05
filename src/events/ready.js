const Event = require('../structures/Event');

class ReadyEvent extends Event {
  constructor(client) {
    super(client, 'ready');
  }

  async handle() {
    this.client.logger.log('[database] Ensuring tables exists');
    await this.client.telephone.contractManager.createTable();

    this.client.logger.log(`[ready] Bot initialized successfully - Serving as ${this.client.user.tag}`);
  }
}

module.exports = ReadyEvent;
