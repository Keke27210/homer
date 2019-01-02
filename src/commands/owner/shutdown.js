const Command = require('../../structures/Command');
const wait = require('util').promisify(setTimeout);

class ShutdownCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shutdown',
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const message = await context.replyLoading(`Shutting down **${this.client.shard.count}** shards...`);

    // Sending messages in radio channels
    //await this.client.radio.saveSessions();
    this.client.voiceConnections.forEach((vc) => {
      if (vc.dispatcher) vc.dispatcher.emit('reboot', true);
      vc.channel.leave();
    });

    await wait(2500);
    await this.client.shard.send({ type: 'shutdown', message: `${context.message.channel.id}|${message.id}|false` });
  }
}

module.exports = ShutdownCommand;
