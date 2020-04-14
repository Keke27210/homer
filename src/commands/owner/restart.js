const Command = require('../../structures/Command');

class RestartCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'restart',
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
      message.success(`Sent restart request for shard \`${id}\`.`);
      this.client.shard.send(`RESTART_${id}`);
    } else {
      message.success('Sent restart request for all shards.');
      this.client.shard.send('RESTARTALL');
    }
  }
}

module.exports = RestartCommand;
