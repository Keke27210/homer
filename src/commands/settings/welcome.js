const Command = require('../../structures/Command');

class WelcomeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'welcome',
      usage: '<message>',
      children: [new ChannelSubcommand(client), new ClearSubcommand(client)],
      userPermissions: ['MANAGE_GUILD'],
      category: 'settings',
    });
  }

  async execute(context) {
    const message = context.args.join(' ');
    if (!message) return context.replyError(context.__('welcome.noMessage'));
    if (message.length > 256) return context.replyWarning(context.__('welcome.messageTooLong'));

    context.settings.welcome.message = message;
    await context.saveSettings();
    context.replySuccess(context.__('welcome.messageSet'));
  }
}

class ChannelSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'channel',
      usage: '[channel]',
      userPermissions: ['MANAGE_GUILD'],
      category: 'settings',
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let { channel } = context.message;
    if (search) {
      const foundChannels = this.client.finder.findRolesOrChannels(context.message.guild.channels, search);
      if (!foundChannels || foundChannels.length === 0 || !foundChannels[0]) return context.replyError(context.__('finderUtil.findChannels.zeroResult', { search }));
      if (foundChannels.length === 1) channel = foundChannels[0];
      else if (foundChannels.length > 1) return context.replyWarning(this.client.finder.formatChannels(foundChannels, context.settings.misc.locale));
    }

    context.settings.welcome.channel = channel.id;
    await context.saveSettings();
    context.replySuccess(context.__('welcome.channel.set', { name: `**#${channel.name}**` }));
  }
}

class ClearSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      userPermissions: ['MANAGE_GUILD'],
      category: 'settings',
    });
  }

  async execute(context) {
    if (!context.settings.welcome.message) return context.replyWarning(context.__('welcome.clear.noMessage'));

    context.settings.welcome.message = null;
    await context.saveSettings();
    context.replySuccess(context.__('welcome.clear.cleared'));
  }
}

module.exports = WelcomeCommand;
