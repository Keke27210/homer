const Command = require('../../structures/Command');

class ContactsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'contacts',
      category: 'telephone',
      children: [new AddSubcommand(client), new DeleteSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));
    if (subscription.contacts.length === 0) return context.replyWarning(context.__('contacts.noEntry'));

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('contacts.title', { name: context.message.guild ? `**#${context.message.channel.name}**` : `**${context.__('global.dm')}**` }),
      null,
      subscription.contacts.map(c => `${this.dot} **${c.number}**: ${c.description}`),
    );
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      category: 'telephone',
      userPermissions: ['MANAGE_GUILD'],
      usage: '<number> [description]',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const number = context.args[0];
    const description = context.args.slice(1).join(' ');
    if (!number) return context.replyError(context.__('contacts.add.noNumber'));
    if (!description) return context.replyError(context.__('contacts.add.noDescription'));
    if (description.length > 64) return context.replyWarning(context.__('contacts.add.descriptionTooLong'));
    if (subscription.contacts.find(c => c.number === number)) return context.replyWarning(context.__('contacts.add.alreadyExists'));

    subscription.contacts.push({ number, description });
    await this.client.database.updateDocument('telephone', subscription.id, { contacts: subscription.contacts });
    context.replySuccess(context.__('contacts.add.added'));
  }
}

class DeleteSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete',
      aliases: ['remove'],
      category: 'telephone',
      userPermissions: ['MANAGE_GUILD'],
      usage: '<number>',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const number = context.args[0];
    if (!number) return context.replyError(context.__('contacts.delete.noNumber'));
    if (!subscription.contacts.find(c => c.number === number)) return context.replyWarning(context.__('contacts.delete.doesntExist'));

    subscription.contacts.splice(subscription.contacts.findIndex(c => c.number === number), 1);
    await this.client.database.updateDocument('telephone', subscription.id, { contacts: subscription.contacts });
    context.replySuccess(context.__('contacts.delete.deleted'));
  }
}

module.exports = ContactsCommand;
