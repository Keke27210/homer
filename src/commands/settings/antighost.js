const Command = require('../../structures/Command');

class AntighostCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'antighost',
      aliases: ['antighostping'],
      category: 'settings',
      children: [
        new EnableSubcommand(client),
        new DisableSubcommand(client),
        new InfoSubcommand(client),
      ],
      dm: true,
    });
  }

  async execute(context) {
    if (!context.message.guild) return context.replyWarning(context.__('antighost.dm'));
    context.reply(context.__('antighost.main', { command: `${this.client.prefix}antighost info` }));
  }
}

class EnableSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'enable',
      category: 'settings',
      dm: true,
    });
  }

  async execute(context) {
    if (context.settings.misc.antighost) return context.replyWarning(context.__('antighost.enabledAlready'));
    context.settings.misc.antighost = true;
    await context.saveSettings();
    context.replySuccess(context.__('antighost.enabled'));
  }
}

class DisableSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'disable',
      category: 'settings',
      dm: true,
    });
  }

  async execute(context) {
    if (!context.settings.misc.antighost) return context.replyWarning(context.__('antighost.disabledAlready'));
    context.settings.misc.antighost = false;
    await context.saveSettings();
    context.replySuccess(context.__('antighost.disabled'));
  }
}

class InfoSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      aliases: ['about'],
      category: 'settings',
      dm: true,
    });
  }

  async execute(context) {
    context.reply(context.__('antighost.info'));
  }
}

module.exports = AntighostCommand;
