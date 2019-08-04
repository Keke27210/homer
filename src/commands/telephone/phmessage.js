const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class PhmessageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'phmessage',
      userPermissions: ['MANAGE_GUILD'],
      category: 'telephone',
      children: [new IncomingSubcommand(client), new MissedSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    if (!subscription.messages) subscription.messages = {}; // Patch to avoid crash
    const messageInformation = [
      `${this.dot} **${context.__('phmessage.embed.incoming')}**: ${subscription.messages.incoming || context.__('global.none')}`,
      `${this.dot} **${context.__('phmessage.embed.missed')}**: ${subscription.messages.missed || context.__('global.none')}`,
    ].join('\n');

    const embed = new RichEmbed().setDescription(messageInformation);
    context.reply(
      context.__('phmessage.title', { name: context.message.guild ? `**#${context.message.channel.name}**` : `**${context.__('global.dm')}**` }),
      { embed },
    );
  }
}

class IncomingSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'incoming',
      userPermissions: ['MANAGE_GUILD'],
      category: 'telephone',
      usage: '<message|clear>',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const text = context.args.join(' ');
    if (!text) return context.replyError(context.__('phmessage.noText'));
    if (text.length > 128) return context.replyWarning(context.__('phmessage.textTooLong'));

    if (!subscription.messages) subscription.messages = {};
    subscription.messages.incoming = (text === 'clear') ? false : text;
    await this.client.database.insertDocument('telephone', subscription, { conflict: 'update' });

    context.replySuccess(context.__('phmessage.incoming.updated'));
  }
}

class MissedSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'missed',
      userPermissions: ['MANAGE_GUILD'],
      category: 'telephone',
      usage: '<message|clear>',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const text = context.args.join(' ');
    if (!text) return context.replyError(context.__('phmessage.noText'));
    if (text.length > 128) return context.replyWarning(context.__('phmessage.textTooLong'));

    if (!subscription.messages) subscription.messages = {};
    subscription.messages.missed = (text === 'clear') ? false : text;
    await this.client.database.insertDocument('telephone', subscription, { conflict: 'update' });

    context.replySuccess(context.__('phmessage.missed.updated'));
  }
}

module.exports = PhmessageCommand;
