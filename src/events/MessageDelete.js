const Event = require('../structures/Event');
const { RichEmbed } = require('discord.js');

class MessageDeleteEvent extends Event {
  constructor(client) {
    super(client, 'messageDelete');
  }

  async handle(message) {
    // Phone
    if (message.author.id !== this.client.user.id) {
      this.client.database.getDocuments('calls')
        .then(async (calls) => {
          const callObject = calls.find(c => [c.sender.id, c.receiver.id].includes(message.channel.id) && c.state === 1);
          if (!callObject) return;

          const target = (message.channel.id === callObject.sender.id) ? callObject.receiver.id : callObject.sender.id;
          const targetMessage = await this.client.rest.methods.getChannelMessages(target, { limit: 100 })
            .then((data) => {
              const filter = m => !m.webhook_id
                && m.author.id == this.client.user.id
                && m.content.startsWith(`📞 **${message.author.username}**#${message.author.discriminator}: ${message.content}`);

              return data.find(filter);
            });
          if (!targetMessage) return;

          this.client.deleteMessage(target, targetMessage.id);
        });
    }

    // Anti ghost-ping
    if (message.guild && message.mentions.members.size > 0) {
      const embed = new RichEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
        .setDescription(message.content)
        .setColor(message.member.displayHexColor)
        .setFooter(`#${message.channel.name} (${message.guild.name})`)
        .setTimestamp(message.editedAt || message.createdAt);

      message.mentions.members
        .forEach(async (u) => {
          if (message.author.id === u.id) return;
          if ((Date.now() - message.createdTimestamp) > (this.client.other.isDonator(u.id) ? 3600000 : 60000)) return;

          const settings = await this.client.database.getDocument('settings', u.id);
          if (!settings || !settings.misc.antighost) return;

          u.send(
            this.client.__(settings.misc.locale, 'antighost.alert', { name: `**${message.author.username}**#${message.author.discriminator}`}),
            { embed },
          );
        });
    }
  }
}

module.exports = MessageDeleteEvent;
