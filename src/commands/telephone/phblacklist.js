const Command = require('../../structures/Command');
const Menu = require('../../structures/Menu');

class PhblacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'phblacklist',
      category: 'telephone',
      userPermissions: ['MANAGE_GUILD'],
      children: [new AddSubcommand(client), new RemoveSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));
    if (subscription.blacklist.length === 0) return context.replyWarning(context.__('phblacklist.noEntry'));

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('phblacklist.title', {
        name: context.message.guild ? `**#${context.message.channel.name}**` : `**${context.__('global.dm')}**`,
      }),
      null,
      subscription.blacklist.map(a => `${this.dot} ${context.__('phblacklist.number')}: **${a.number}** - ${context.__('phblacklist.date')}: **${context.formatDate(a.time)}**`),
    );
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      usage: '<number>',
      category: 'telephone',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const number = context.args[0];
    if (!number) return context.replyError(context.__('phblacklist.add.noNumber'));
    if (number === subscription.number) return context.replyError(context.__('phblacklist.add.cannotAddThis'));

    const toSubscription = await this.client.database.findDocuments('telephone', { number }).then(a => a[0]);
    if (!toSubscription) return context.replyWarning(context.__('phblacklist.add.notFound', { number }));

    const blacklistEntry = subscription.blacklist.find(b => b.channel === toSubscription.id);
    if (blacklistEntry) {
      return context.replyWarning(context.__('phblacklist.add.alreadyExist', { number: blacklistEntry.number }));
    }

    subscription.blacklist.push({
      number: toSubscription.number,
      channel: toSubscription.id,
      time: Date.now(),
    });
    await this.client.database.updateDocument('telephone', context.message.channel.id, { blacklist: subscription.blacklist });
    context.replySuccess(context.__('phblacklist.add.added', { number: toSubscription.number }));
  }
}

class RemoveSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      aliases: ['delete'],
      usage: '<number>',
      category: 'telephone',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const number = context.args[0];
    if (!number) return context.replyError(context.__('phblacklist.remove.noNumber'));

    const blacklistEntry = subscription.blacklist.find(b => b.number === number);
    if (!blacklistEntry) {
      return context.replyWarning(context.__('phblacklist.remove.notFound', { number }));
    }

    subscription.blacklist.splice(subscription.blacklist.indexOf(blacklistEntry), 1);
    await this.client.database.updateDocument('telephone', context.message.channel.id, { blacklist: subscription.blacklist });
    context.replySuccess(context.__('phblacklist.remove.removed', { number }));
  }
}

module.exports = PhblacklistCommand;
