const Command = require('../../structures/Command');

class PingCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'ping',
      dm: true,
    });
  }

  async main(message) {
    let rest = Date.now();
    await this.client.api.gateway.get().then(() => {
      rest -= Date.now();
    });

    message.send(message._('ping.pong', this.client.ws.ping, Math.abs(rest)));
  }
}

module.exports = PingCommand;
