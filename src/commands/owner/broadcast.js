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
    const subscriptions = await this.client.database.getDocuments('telephone', true);

    const embed = new RichEmbed()
      .setAuthor(context.message.author.username, context.message.author.avatarURL)
      .setDescription(message)
      .setColor('RED')
      .setTimestamp(new Date());

    const m = await context.reply('📡 Are you sure you want to send this message?', { embed });
    (async function () {
      for (const emote of this.emotes) await m.react(emote);
    })();

    m.awaitReactions(
      (reaction, user) => this.emotes.includes(reaction.emoji.id) && user.id === context.message.author.id,
      { max: 1 },
    ).then((reactions) => {
      const emoji = reactions.first().emoji.identifier;
      if (emoji === this.emotes[0]) {
        for (const subscription of subscriptions) {
          const lang = await this.client.database.getDocument('settings', subscription.settings)
            .then(s => s ? s.misc.locale : this.client.localization.defaultLocale);
    
          this.client.sendMessage(
            subscription.id,
            this.client.__(lang, 'broadcast.announcement'),
            { embed },
          );
        }
    
        m.edit(
          '📡 You have sent the announcement to Homer subscriptions.',
          { embed },
        );
      } else {
        m.edit('📡 You have not sent the announcement to Homer subscriptions.');
      }
    });
  }

  get emotes() {
    return [this.client.constants.emotes.successID, this.client.constants.emotes.errorID];
  }
}

module.exports = BroadcastCommand;
