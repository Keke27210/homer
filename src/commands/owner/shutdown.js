const Command = require('../../structures/Command');

class ShutdownCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shutdown',
      private: true,
    });
  }

  async main(message, args) {
    const code = parseInt(args[0], 10) || 0;
    await message.send(`🔌 Shutting down with exit code \`${code}\`.`);
    this.client.shutdown();
  }
}

module.exports = ShutdownCommand;
