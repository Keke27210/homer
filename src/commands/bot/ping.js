const Command = require('../../structures/Command');

class PingCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'ping',
      dm: true,
    });
  }

  main(message) {
    message.send(message._('ping.pong', this.client.ws.ping));
  }
}

module.exports = PingCommand;
