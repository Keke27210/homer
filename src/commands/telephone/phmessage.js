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

    const messageInformation = [
      `${this.dot} **${context.__('phmessage.embed.incoming')}**: ${subscription.message.incoming || context.__('global.none')}`,
      `${this.dot} **${context.__('phmessage.embed.missed')}**: ${subscription.message.missed || context.__('global.none')}`,
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

    await this.client.database.updateDocument('telephone', context.message.channel.id, {
      message: {
        incoming: text === 'clear' ? false : text,
      },
    });
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

    await this.client.database.updateDocument('telephone', context.message.channel.id, {
      message: {
        missed: text === 'clear' ? false : text,
      },
    });
    context.replySuccess(context.__('phmessage.missed.updated'));
  }
}

module.exports = PhmessageCommand;
