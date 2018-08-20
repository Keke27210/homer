const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class ServicetelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'servicetel',
      category: 'telephone',
      children: [new CancelSubcommand(client)],
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
    const server = await this.client.rest.makeRequest('get', `/guilds/${subscription.settings}`, true)
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
    return [this.client.constants.emotes.successID, this.client.constants.emotes.errorID];
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
      (reaction, user) => this.reactions.includes(reaction.emoji.identifier) && user.id === context.message.author.id,
      { max: 1 },
    )
      .then(async (reactions) => {
        const r = reactions.first().emoji.identifier;
        if (r === this.reactions[1]) {
          m.edit(`${this.client.constants.emotes.success} The subscription has not been deleted`);
        } else {
          await this.client.database.deleteDocument('telephone', subscription.id);
          m.edit(`${this.client.constants.emotes.success} The subscription for **${number}** has been deleted!`);
        }

        if (context.message.guild && context.message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
          m.clearReactions();
        }
      });
  }
}

module.exports = ServicetelCommand;
