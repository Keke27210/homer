const Command = require('../../structures/Command');

class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      usage: '<message>',
      children: [new ChannelSubcommand(client), new ClearSubcommand(client)],
      userPermissions: ['MANAGE_GUILD'],
      category: 'settings',
    });
  }

  async execute(context) {
    const message = context.args.join(' ');
    if (!message) return context.replyError(context.__('leave.noMessage'));
    if (message.length > 256) return context.replyWarning(context.__('leave.messageTooLong'));

    context.settings.leave.message = message;
    await context.saveSettings();
    context.replySuccess(context.__('leave.messageSet'));
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

    context.settings.leave.channel = channel.id;
    await context.saveSettings();
    context.replySuccess(context.__('leave.channel.set', { name: `**#${channel.name}**` }));
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
    if (!context.settings.leave.message) return context.replyWarning(context.__('leave.clear.noMessage'));

    context.settings.leave.message = null;
    await context.saveSettings();
    context.replySuccess(context.__('leave.clear.cleared'));
  }
}

module.exports = LeaveCommand;
