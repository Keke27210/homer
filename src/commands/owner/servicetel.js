const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class ServicetelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'servicetel',
      category: 'owner',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const number = context.args[0];
    if (!number) return context.replyError('No telephone number specified.');

    const subscription = await this.client.database.findDocuments('telephone', { number })
      .then(s => s[0])
      .catch(() => null);
    if (!subscription) return context.replyWarning(`No subscription found with number \`${number}\`.`);

    const subscriber = await this.client.fetchUser(subscription.subscriber)
      .catch(() => null);
    let guild;
    let channel;
    if (subscription.settings) {
      const channelInfo = await this.client.rest.makeRequest('get', `/channels/${subscription.id}`, true)
        .catch(() => null);
      const serverInfo = await this.client.rest.makeRequest('get', `/guilds/${subscription.settings}`, true)
        .then(svr => `**${svr.name}** (ID:${svr.id})`)
        .catch(() => null);
      if (serverInfo) {
        guild = serverInfo;
        channel = `**#${channelInfo.name}** (ID:${channelInfo.id})`;
      }
    }
    const subInfo = [
      `${this.dot} Subscriber: ${subscriber ? `**${subscriber.username}**#${subscriber.discriminator} (ID:${subscriber.id})` : '*Unknown*'}`,
      `${this.dot} Location: ${guild || '*Direct Messages*'}`,
      `${this.dot} Channel: ${channel || '*None*'}`,
      `${this.dot} Phonebook: ${subscription.phonebook ? `**${subscription.phonebook}**` : 'None'}`,
      `${this.dot} SMS: **${subscription.textable ? 'Yes' : 'No'}**`,
      `${this.dot} Subscription date: **${context.formatDate(subscription.time)}**`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(subInfo);
    context.reply(`📞 Information about telephone line \`${number}\`:`, { embed });
  }
}

module.exports = ServicetelCommand;
