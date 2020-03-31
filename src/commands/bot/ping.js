const Command = require('../../structures/Command');

class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      aliases: ['pong', 'peng', 'pung'],
      category: 'bot',
      dm: true,
    });
  }

  async execute(context) {
    const sentMessage = await context.reply(context.__('ping.ping'));
    let msg = context.__('ping.pong', {
      api: Math.floor(this.client.ping),
      heartbeat: (sentMessage.createdTimestamp - context.message.createdTimestamp),
    });
    if (context.message.author.id === '205427654042583040') {
      msg += ' Process: ' + (Date.now() - context.time) + 'ms';
    }
    sentMessage.edit(msg);
  }
}

module.exports = PingCommand;
