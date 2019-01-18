const Event = require('../structures/Event');
const { RichEmbed } = require('discord.js');

class MessageEvent extends Event {
  constructor(client) {
    super(client, 'message');
  }

  async handle(message) {
    // Command handling
    this.client.commands.handleCommand(message);

    // Set last active
    this.client.database.insertDocument(
      'lastactive',
      { id: message.author.id, time: Date.now() },
      { conflict: 'update' },
    );

    // Remove AFK
    this.client.database.getDocument('afk', message.author.id)
      .then(async (afkObject) => {
        if (!afkObject) return;

        const userSettings = await this.client.database.getDocument('settings', message.author.id) || this.client.constants.defaultUserSettings(message.author.id);
        this.client.database.deleteDocument('afk', message.author.id);
        message.author.send(this.client.__(userSettings.misc.locale, 'afk.removeMessage'));
      });

    // AFK notification
    const mentions = message.guild ? message.mentions.members.keyArray() : [];
    if (message.guild && !message.author.bot && mentions.length > 0) {
      const guildSettings = await this.client.database.getDocument('settings', message.guild.id) || this.client.constants.defaultGuildSettings(message.guild.id);
      const msg = [];
      for (const id of mentions) {
        const user = await this.client.fetchUser(id);
        if (!user) continue;

        const afk = await this.client.database.getDocument('afk', user.id);
        if (!afk) continue;

        msg.push(`${this.client.constants.emotes.dot} **${user.username}**#${user.discriminator}: ${afk.message || this.client.__(guildSettings.misc.locale, 'global.noReason')} • ${this.client.time.timeSince(afk.time, guildSettings.misc.locale, true, true)}`);
      }

      if (msg.length > 0) {
        const embed = new RichEmbed().setDescription(msg.join('\n'));
        message.channel.send(`${this.client.constants.emotes.warning} ${this.client.__(guildSettings.misc.locale, 'afk.messageHandler')}`, { embed });
      }
    }

    // Handle phone call
    this.client.telephone.handleMessage(message);
  }
}

module.exports = MessageEvent;
