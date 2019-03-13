const Routine = require('../structures/Routine');

class MiscRoutine extends Routine {
  constructor(client) {
    super(client);
  }

  async handle() {
    // RSS feeds
    if (this.client.shard.id === 0 && new Date().getMinutes() === 15) {
      this.client.other.processRSS();
    }

    // Statistics logging
    if (new Date().getHours() === 12 && this.client.shard.id === 0) {
      const stats = await this.client.database.getDocument('bot', 'stats');
      const commandCount = await this.client.database.provider.table('commandStats').count();
      const time = Date.now();
  
      stats.commands.push({ time, count: commandCount });
      stats.guilds.push({ time, count: this.client.guilds.size });
      this.client.database.updateDocument('bot', 'stats', stats);
    }
  }
}

module.exports = MiscRoutine;
