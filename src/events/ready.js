const Event = require('../structures/Event');

class ReadyEvent extends Event {
  constructor(client) {
    super(client, 'ready');
  }

  async handle() {
    if (this.client.database.ready) {
      // Creating provider tables
      this.client.logger.log('[database] Creating table if not exists');
      await this.client.tracking.createTable();
      await this.client.settings.createTable();
      await this.client.radios.createTable();
      await this.client.telephone.contracts.createTable();
      await this.client.telephone.calls.createTable();
      await this.client.telephone.phonebook.createTable();

      // Clearing outdated tracking
      this.client.tracking.deleteEntries();
    }

    this.client.ready = true;
    this.client.logger.log(`[ready] Bot initialized successfully - Serving as ${this.client.user.username}`);
  }
}

module.exports = ReadyEvent;
