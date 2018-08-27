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


    for (const interval of this.client._intervals) this.client.clearInterval(interval);
    // Update game & bot list count
    this.client.update.updateGame();
    this.client.update.updateBotList();
    this.client.other.updateShardStatus();
    this.client.setInterval(() => {
      this.client.update.updateGame();
      this.client.update.updateBotList();
    }, 30000);
    this.client.setInterval(() => this.client.other.updateShardStatus(), 1000);

    this.client.ready = true;
  }
}

module.exports = ReadyEvent;
