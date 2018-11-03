const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class BroadcastCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'broadcast',
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const message = context.args.join(' ');
    if (!message) return context.replyError('You must provide a message to broadcast!');
    if (message.length > 1024) return context.replyWarning('The message length must not exceed 1024 characters.');

    const subscriptions = await this.client.database.getDocuments('telephone', true)
      .then((subs) => subs.map(sub => sub.id));

    const embed = new RichEmbed()
      .setAuthor(context.message.author.username, context.message.author.avatarURL)
      .setDescription(message)
      .setColor('RED')
      .setTimestamp(new Date());

    for (const subscription of subscriptions) {
      this.client.sendMessage(
        subscription,
        '📡 Announcement from Homer developers',
        { embed },
      );
    }

    context.reply(
      '📡 Announcement sent to all Homer telephone lines.',
      { embed },
    );
  }
}

module.exports = BroadcastCommand;
