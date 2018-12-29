const Command = require('../../structures/Command');
const wait = require('util').promisify(setTimeout);

class RestartCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const message = await context.replyLoading(`Restarting **${this.client.shard.count}** shards...`);
    await this.client.database.updateDocument('bot', 'settings', { reboot: [context.message.channel.id, message.id] });

    // Sending messages in radio channels
    this.client.voiceConnections.forEach((vc) => {
      vc.dispatcher.emit('reboot');
      vc.channel.leave();
    });

    await wait(2500);
    await this.client.shard.send({ type: 'shutdown', message: `${context.message.channel.id}|${message.id}|true` });
  }
}

module.exports = RestartCommand;
