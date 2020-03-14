const Command = require('../../structures/Command');

class CallsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'calls',
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const calls = await this.client.database.getDocuments('calls', true);
    if (calls.length === 0) return context.replyWarning('There is no ongoing call at the moment.');

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      '📞 Ongoing telephone calls:',
      null,
      calls.map(call => `${this.dot} Sender: **${call.sender.number}** - Receiver: **${call.receiver.number}** - Created ${this.client.time.timeSince(call.start, 'en-gb', true, true)} - Last activity: ${this.client.time.timeSince(call.active, 'en-gb', true, true)}`),
    );
  }
}

module.exports = CallsCommand;
