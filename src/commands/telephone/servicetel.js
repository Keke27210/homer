const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class ServicetelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'servicetel',
      category: 'telephone',
      hidden: true,
    });
  }

  async execute(context) {
    if (!context.message.member.roles.has(this.client.config.misc.supportTeamRole)) {
      return context.replyError('You must be a member of the **Support Team** to use this command.');
    }

    const number = context.args[0];
    if (!number) return context.replyError('You must provide a telephone number to lookup for.');

    const subscription = await this.client.database.findDocuments('telephone', { number }).then(a => a[0]);
    if (!subscription) return context.replyWarning(`No subscription found for number **${number}**.`);

    const subscriber = await this.client.fetchUser(subscription.subscriber);
    const server = this.client.rest.makeRequest('get', `/guilds/${subscription.settings}`, true)
      .then(a => a.name)
      .catch(() => 'Direct Messages');

    const embed = new RichEmbed()
      .setDescription([
        `${this.dot} Subscriber: **${subscriber.username}**#${subscriber.discriminator} (ID:${subscriber.id})`,
        `${this.dot} Server: **${server}** (ID:${subscription.settings})`,
        `${this.dot} Phonebook: ${subscription.phonebook ? `**Yes** (**${subscription.phonebook}**)` : `**No**`}`,
        `${this.dot} Textable: **${subscription.textable ? 'Yes' : 'No'}**`,
        `${this.dot} Date: **${context.formatDate(subscription.time)}**`,
      ]);

    context.reply(
      `📞 Information about subscription **${number}**:`,
      { embed },
    );
  }
}

class CancelSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cancel',
      category: 'telephone',
      hidden: true,
    });
  }

  get reactions() {
    return [this.client.constants.emotes.success, this.client.constants.emotes.error];
  }

  async execute(context) {
    if (!context.message.member.roles.has(this.client.config.misc.supportTeamRole)) {
      return context.replyError('You must be a member of the **Support Team** to use this command.');
    }

    const number = context.args[0];
    if (!number) return context.replyError('You must provide a telephone number to lookup for.');

    const subscription = await this.client.database.findDocuments('telephone', { number }).then(a => a[0]);
    if (!subscription) return context.replyWarning(`No subscription found for number **${number}**.`);

    const m = await context.replyWarning(`Are you sure to cancel subscription for **${number}**?`);
    for (const e of this.reactions) await m.react(e);

    m.awaitReactions(
      (reaction, user) => this.reactions.includes(reaction.emoji.name) && user.id === context.message.author.id,
      { max: 1 },
    )
      .then(async (reactions) => {
        const r = reactions.first().emoji.name;
        if (r === this.reactions[1]) return m.edit('The subscription has not been deleted');
        await this.client.database.deleteDocument('telephone', subscription.id);
        m.edit(`The subscription for **${number}** has been deleted!`);
      });
  }
}

module.exports = ServicetelCommand;
