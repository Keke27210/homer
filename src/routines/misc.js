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

    // Update donators list
    this.client.database.getDocuments('donators', true)
      .then((donators) => {
        this.client.donators = donators;
      });

    // Statistics logging
    if (new Date().getHours() === 12 && this.client.shard.id === 0) {
      const stats = await this.client.database.getDocument('bot', 'stats');
      const commandCount = await this.client.database.provider.table('commandStats').count();
      const time = Date.now();
  
      stats.commands.push({ time, count: commandCount });
      stats.guilds.push({ time, count: this.client.guilds.size });
      this.client.database.updateDocument('bot', 'stats', stats);
    }

    // Game update
    const game = await this.client.database.getDocument('bot', 'settings')
      .then(settings => settings.customGame) || 'Type {prefix}help! On {servers} servers on shard {shard}.';

    this.client.user.setActivity(
      game
        .replace(/{prefix}/g, this.client.prefix)
        .replace(/{servers}/g, this.client.guilds.size)
        .replace(/{users}/g, this.client.users.size)
        .replace(/{shard}/g, this.client.shard.id)
        .replace(/{shards}/g, this.client.config.sharder.totalShards),
      { type: 'PLAYING' },
    );
  }
}

module.exports = MiscRoutine;
