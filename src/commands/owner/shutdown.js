const Command = require('../../structures/Command');

class ShutdownCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'shutdown',
      dm: true,
      private: true,
    });
  }

  async main(message, args) {
    let id = args[0];
    if (id) {
      id = parseInt(id, 10);
      if (Number.isNaN(id)) {
        message.warn(`The provided ID is not a number.`);
        return;
      }
      message.success(`Sent kill request for cluster \`${id}\`.`);
      this.client.shard.send(`KILL_${id}`);
    } else {
      message.success('Sent kill request for all clusters.');
      this.client.shard.send('KILLALL');
    }
  }
}

module.exports = ShutdownCommand;
