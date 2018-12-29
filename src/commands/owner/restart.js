const Command = require('../../structures/Command');

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


    await this.client.shard.send({ type: 'shutdown', message: `${context.message.channel.id}|${message.id}|true` });
  }
}

module.exports = RestartCommand;
