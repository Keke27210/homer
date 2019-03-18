const Command = require('../../structures/Command');

class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefix',
      aliases: ['prefixes'],
      category: 'settings',
      children: [new AddSubcommand(client), new RemoveSubcommand(client)],
      userPermission: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    if (context.settings.prefixes.length === 0) {
      return context.replyWarning(context.__('prefix.noPrefix', { name: context.message.guild ? `**${context.message.guild.name}**` : `**${context.message.author.username}**#${context.message.author.discriminator}` }));
    }

    context.replySuccess([
      context.__('prefix.list', { name: context.message.guild ? `**${context.message.guild.name}**` : `**${context.message.author.username}**#${context.message.author.discriminator}` }),
      context.settings.prefixes.map(p => `\`${p}\``).join(' '),
    ].join('\n'));
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      category: 'settings',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const prefix = context.args.join(' ');
    if (!prefix) return context.replyError(context.__('prefix.add.noPrefix'));
    if (prefix.length > 32) return context.replyError(context.__('prefix.add.prefixTooLong'));

    if (context.settings.prefixes.includes(prefix.toLowerCase())) {
      return context.replyWarning(context.__('prefix.add.alreadyAdded', { prefix }));
    }

    if (this.client.config.discord.prefixes.includes(prefix.toLowerCase())) {
      return context.replyWarning(context.__('prefix.add.systemPrefix', { prefix }));
    }

    context.settings.prefixes.push(prefix.toLowerCase());
    await context.saveSettings();
    context.replySuccess(context.__('prefix.add.addedPrefix', { prefix }));
  }
}

class RemoveSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      aliases: ['delete'],
      category: 'settings',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const prefix = context.args.join(' ');
    if (!prefix) return context.replyError(context.__('prefix.remove.noPrefix'));

    if (!context.settings.prefixes.includes(prefix.toLowerCase())) {
      return context.replyWarning(context.__('prefix.remove.notFound', { prefix }));
    }

    context.settings.prefixes.splice(context.settings.prefixes.indexOf(prefix.toLowerCase()), 1);
    await context.saveSettings();
    context.replySuccess(context.__('prefix.remove.removedPrefix', { prefix }));
  }
}

module.exports = PrefixCommand;
