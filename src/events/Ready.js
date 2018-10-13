const mtz = require('moment-timezone');
const Event = require('../structures/Event');

class ReadyEvent extends Event {
  constructor(client) {
    super(client, 'ready');
  }

  async handle() {
    // Notifying sharder
    this.client.shard.send({
      type: 'log',
      message: `This shard is READY - ${this.client.guilds.size} servers - ${this.client.users.size} users`,
    });

    // Sending message in logChannel
    this.client.sendMessage(this.client.config.logChannel, `\`[${mtz().format('HH:mm:ss')}]\` 📡 Shard ID **${this.client.shard.id}** is now **READY**.`);
    this.client.shardStatus = 'online';

    // Update game & bot list count
    this.client.update.updateGame();
    this.client.update.updateBotList();
    this.client.other.updateShardStatus();

    if (!this.client.firstStart) {
      this.client.setInterval(() => {
        if (!this.client.ready) return;
        this.client.update.updateBotList();
      }, 30000);

      this.client.setInterval(() => {
        if (!this.client.ready) return;
        this.client.update.updateGame();
      }, 10000);

      this.client.setInterval(() => {
        if (!this.client.ready) return;
        this.client.other.updateShardStatus();
      }, 1000);
    }

    this.client.firstStart = true;
    this.client.ready = true;
  }
}

module.exports = ReadyEvent;
