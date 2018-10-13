const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class DonatorsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'donators',
      aliases: ['donate', 'donations'],
      category: 'bot',
      children: [new AddSubcommand(client), new RemoveSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    const donatorsTable = await this.client.database.getDocuments('donators', true);
    const donatorsList = [];

    for (const donator of donatorsTable) {
      const user = await this.client.fetchUser(donator.id);
      donatorsList.push(`**${user.username}**#${user.discriminator}`);
    }

    const embed = new RichEmbed()
      .setDescription(context.__(
        'donators.embedDescription',
        { link: this.client.constants.donationLink },
      ))
      .addField(
        context.__('donators.donatorsList'),
        donatorsList.join('\n') || context.__('global.none'),
      )

    context.reply(
      context.__('donators.main', { name: this.client.user.username }),
      { embed },
    );
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      usage: '<userID> <amount>',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const userID = context.args[0];
    const amount = context.args.slice(1).join(' ');
    if (!userID) return context.replyError('You must provide the ID of a user to add!');
    if (!amount) return context.replyError('You must provide the amount of the donation!');

    const user = await this.client.fetchUser(userID)
      .catch(() => null);
    if (!user) return context.replyWarning(`I could not find any user with ID: \`${userID}\`.`);

    await this.client.database.insertDocument('donators', { id: userID, amount }, { conflict: 'update' });
    context.replySuccess(`**${user.username}**#${user.discriminator} has been added to the list of donators`);
  }
}

class RemoveSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      aliases: ['delete'],
      usage: '<userID>',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const userID = context.args[0];
    if (!userID) return context.replyError('You must provide the ID of a user to delete!');

    const donationObject = await this.client.database.getDocument('donators', userID);
    if (!donationObject) return context.replyError(`I could not find any donator with ID: \`${userID}\`.`);

    const user = await this.client.fetchUser(userID)
      .catch(() => null);
    if (!user) return context.replyWarning(`I could not find any user with ID: \`${userID}\`.`);

    await this.client.database.deleteDocument('donators', userID);
    context.replySuccess(`**${user.username}**#${user.discriminator} has been removed from the list of donators`);
  }
}

module.exports = DonatorsCommand;
