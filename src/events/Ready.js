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

    // If it is a reboot, edit the message and clear cache
    const reboot = await this.client.database.getDocument('bot', 'settings').then(s => s.reboot);
    if (reboot) {
      this.client.updateMessage(reboot[0], reboot[1], `${this.client.constants.emotes.success} Successfully restarted all shards!`);
      this.client.database.updateDocument('bot', 'settings', { reboot: null });
      //this.client.other.ilAFreeIlAToutCompris('This shard has restarted successfully');
    }

    // Resume audio sessions
    //this.client.radio.resumeSessions();

    this.client.ready = true;
  }
}

module.exports = ReadyEvent;
