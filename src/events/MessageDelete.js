const Event = require('../structures/Event');
const { RichEmbed } = require('discord.js');

class MessageDeleteEvent extends Event {
  constructor(client) {
    super(client, 'messageDelete');
  }

  async handle(message) {
    // Anti ghost-ping
    if (message.guild && message.mentions.members.size > 0) {
      const embed = new RichEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
        .setDescription(message.content)
        .setColor(message.member ? message.member.displayHexColor : undefined)
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

    // Phone
    if (message.author.id !== this.client.user.id) {
      const calls = await this.client.database.getDocuments('calls', true);
      const call = calls.find(c => c.type === 0 ? [c.sender.id, c.receiver.id].includes(message.channel.id) : c.receivers.find(r => r.id === message.channel.id));
      if (!call) return;
  
      if (call.type === 0) {
        const target = (message.channel.id === call.sender.id) ? call.receiver.id : call.sender.id;
        const targetMessage = await this.client.rest.methods.getChannelMessages(target, { limit: 100 })
          .then((data) => {
            const filter = m => !m.webhook_id
              && m.author.id == this.client.user.id
              && m.content.startsWith(`📞 **${message.author.username}**#${message.author.discriminator}: ${message.content}`);
  
            return data.find(filter);
          });
        if (!targetMessage) return;
  
        this.client.deleteMessage(target, targetMessage.id);
      } else {
        const thisReceiver = call.receivers.find(r => r.id === message.channel.id);
        for (const receiver of call.receivers) {
          if (receiver.id === thisReceiver.id) continue;

          const contact = receiver.contacts.find(c => c.number === thisReceiver.number);
          const identity = contact ? `**${contact.description}** / **${contact.number}**` : `**${thisReceiver.number}**`;
          const targetMessage = await this.client.rest.methods.getChannelMessages(receiver.id, { limit: 20 })
            .then((data) => {
              const filter = m => !m.webhook_id
                && m.author.id == this.client.user.id
                && m.content.startsWith(`📞 **${message.author.username}**#${message.author.discriminator} (${identity}): ${message.content}`);
    
              return data.find(filter);
            });
          if (!targetMessage) return;
    
          this.client.deleteMessage(receiver.id, targetMessage.id);
        }
      }
    }
  }
}

module.exports = MessageDeleteEvent;
