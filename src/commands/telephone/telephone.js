const Command = require('../../structures/Command');
const moment = require('moment');
const { RichEmbed } = require('discord.js');

class TelephoneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'telephone',
      aliases: ['phone'],
      children: [
        new SubscribeSubcommand(client),
        new TerminateSubcommand(client),
        new PhonebookSubcommand(client),
        new SwitchSubcommand(client),
        new TextSubcommand(client),
        new ChangeSubcommand(client),
        new RulesSubcommand(client),
        new HistorySubcommand(client),
      ],
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) {
      return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));
    }

    const subscriber = await this.client.fetchUser(subscription.subscriber)
      .then(u => `**${u.username}**#${u.discriminator}`)
      .catch(() => null);

    const subscriptionInformation = [
      `${this.dot} ${context.__('telephone.embed.number')}: **${subscription.number}**`,
      `${this.dot} ${context.__('telephone.embed.subscriber')}: ${subscriber || `*${context.__('global.unknown')}*`}`,
      `${this.dot} ${context.__('telephone.embed.phonebook')}: ${subscription.phonebook ? `**${context.__('global.yes')}** (${subscription.phonebook})` : `**${context.__('global.no')}**`}`,
      `${this.dot} ${context.__('telephone.embed.textable')}: **${subscription.textable ? context.__('global.yes') : context.__('global.no')}**`,
      `${this.dot} ${context.__('telephone.embed.date')}: **${context.formatDate(subscription.time)}**`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(subscriptionInformation);

    context.reply(
      context.__('telephone.title', { name: context.message.guild ? `**#${context.message.channel.name}**` : `**${context.__('global.dm')}**` }),
      { embed },
    );
  }
}

class SubscribeSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'subscribe',
      aliases: ['setup'],
      userPermissions: ['MANAGE_GUILD'],
      botPermissions: ['ADD_REACTIONS'],
      usage: '[message]',
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (subscription) return context.replyWarning(context.__('telephone.setup.subscriptionExist', { command: `${this.client.prefix}telephone terminate` }));

    const state = await this.client.database.getDocument('bot', 'settings').then(s => s.subscriptions);
    if (!state) return context.replyWarning(context.__('telephone.setup.disabledSubscriptions'));

    const msg = context.args.join(' ');
    if (msg && msg.length > 64) return context.replyWarning(context.__('telephone.phonebook.messageTooLong'));

    const noticeInformation = Object.keys(this.client.localization.locales['en-gb'])
      .filter(key => key.startsWith('telephone.notice.'))
      .map(key => `${this.dot} ${context.__(key)}`)
      .join('\n');

    const embed = new RichEmbed()
      .setDescription(noticeInformation);

    const message = await context.reply(
      context.__('telephone.notice'),
      { embed },
    );

    await message.react(this.client.constants.emotes.successID);
    await message.react(this.client.constants.emotes.errorID);

    message.awaitReactions(
      //(reaction, user) => [this.client.constants.emotes.successID, this.client.constants.emotes.errorID].includes(reaction.emoji.identifier) && user.id === context.message.author.id,
      () => true,
      { max: 1 },
    )
      .then(async (reactions) => {
        if (reactions.first().emoji.identifier !== this.client.constants.emotes.successID) {
          
          return context.replyWarning(context.__('telephone.setup.cancelled'));
        }
        message.delete();

        const time = Date.now();
        const number = this.client.other.generateNumber(context.message.channel.id);
        const setupInformation = [
          `${this.dot} ${context.__('telephone.embed.number')}: **${number}**`,
          `${this.dot} ${context.__('telephone.embed.subscriber')}: **${context.message.author.username}**#${context.message.author.discriminator}`,
          `${this.dot} ${context.__('telephone.embed.phonebook')}: ${msg ? `**${context.__('global.yes')}** (${msg})` : `**${context.__('global.no')}**`}`,
          `${this.dot} ${context.__('telephone.embed.date')}: **${context.formatDate(time)}**`,
          '',
          `${this.dot} ${context.__('telephone.setup.confirmation', { success: this.client.constants.emotes.success, error: this.client.constants.emotes.error })}`,
        ].join('\n');

        const embed2 = new RichEmbed()
          .setDescription(setupInformation);

        const message2 = await context.reply(
          context.__('telephone.setup.title', { name: context.message.guild ? `**#${context.message.channel.name}**` : `**${context.__('global.dm')}**` }),
          { embed: embed2 },
        );

        await message2.react(this.client.constants.emotes.successID);
        await message2.react(this.client.constants.emotes.errorID);

        message2.awaitReactions(
          (reaction, user) => [this.client.constants.emotes.successID, this.client.constants.emotes.errorID].includes(reaction.emoji.identifier) && user.id === context.message.author.id,
          { max: 1 },
        )
          .then(async (reactions) => {
            const emoji = reactions.first().emoji.identifier;

            if (context.message.guild && context.message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
              message.clearReactions();
            }

            if (emoji === this.client.constants.emotes.successID) {
              await this.client.database.insertDocument(
                'telephone',
                {
                  id: context.message.channel.id,
                  settings: context.message.guild ? context.message.guild.id : context.message.author.id,
                  number,
                  subscriber: context.message.author.id,
                  phonebook: msg || false,
                  textable: true,
                  blacklist: [],
                  contacts: [],
                  history: [],
                  message: {
                    incoming: false,
                    missed: false,
                  },
                  time,
                },
                {
                  conflict: 'update',
                },
              );

              message.edit(`${this.client.constants.emotes.success} ${context.__('telephone.setup.done')}`);
            } else {
              message.edit(`${this.client.constants.emotes.success} ${context.__('telephone.setup.cancelled')}`);
            }
          });
      });
  }
}

class TerminateSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'terminate',
      userPermissions: ['MANAGE_GUILD'],
      botPermissions: ['ADD_REACTIONS'],
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const subscriber = await this.client.fetchUser(subscription.subscriber)
      .then(u => `**${u.username}**#${u.discriminator}`)
      .catch(() => null);

    const terminateInformation = [
      `${this.dot} ${context.__('telephone.embed.number')}: **${subscription.number}**`,
      `${this.dot} ${context.__('telephone.embed.subscriber')}: ${subscriber || `*${context.__('global.unknown')}*`}`,
      `${this.dot} ${context.__('telephone.embed.date')}: **${context.formatDate(subscription.time)}**`,
      '',
      `${this.dot} ${context.__('telephone.terminate.confirmation', { success: this.client.constants.emotes.success, error: this.client.constants.emotes.error })}`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(terminateInformation);

    const message = await context.reply(
      context.__('telephone.terminate.title', { name: context.message.guild ? `**#${context.message.channel.name}**` : `**${context.__('global.dm')}**` }),
      { embed },
    );

    await message.react(this.client.constants.emotes.successID);
    await message.react(this.client.constants.emotes.errorID);

    message.awaitReactions(
      (reaction, user) => [this.client.constants.emotes.successID, this.client.constants.emotes.errorID].includes(reaction.emoji.identifier) && user.id === context.message.author.id,
      { max: 1 },
    )
      .then(async (reactions) => {
        const emoji = reactions.first().emoji.identifier;

        if (context.message.guild && context.message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
          message.clearReactions();
        }

        if (emoji === this.client.constants.emotes.successID) {
          await this.client.database.deleteDocument('telephone', context.message.channel.id);
          message.edit(`${this.client.constants.emotes.success} ${context.__('telephone.terminate.done')}`);
        } else {
          message.edit(`${this.client.constants.emotes.success} ${context.__('telephone.terminate.cancelled')}`);
        }
      });
  }
}

class PhonebookSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'phonebook',
      userPermissions: ['MANAGE_GUILD'],
      category: 'telephone',
      usage: '<message|off>',
      dm: true,
    });
  }

  async execute(context) {
    const message = context.args.join(' ');
    if (!message) return context.replyError(context.__('telephone.phonebook.noMessage'));
    if (message.length > 64) return context.replyWarning(context.__('telephone.phonebook.messageTooLong'));

    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    if (message.toLowerCase() === 'off') {
      if (!subscription.phonebook) return context.replyWarning(context.__('telephone.phonebook.alreadyDisabled'));
      await this.client.database.updateDocument('telephone', context.message.channel.id, { phonebook: false });
      context.replySuccess(context.__('telephone.phonebook.disabled'));
    } else {
      await this.client.database.updateDocument('telephone', context.message.channel.id, { phonebook: message });
      context.replySuccess(context.__('telephone.phonebook.enabled'));
    }
  }
}

class SwitchSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'switch',
      category: 'telephone',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const current = await this.client.database.getDocument('bot', 'settings').then(s => s.telephone);
    if (current) {
      await this.client.database.updateDocument('bot', 'settings', { telephone: false });
      context.replySuccess('The telephone service has been successfully **disabled**!');
    } else {
      await this.client.database.updateDocument('bot', 'settings', { telephone: true });
      context.replySuccess('The telephone service has been successfully **enabled**!');
    }
  }
}

class RulesSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rules',
      aliases: ['tos', 'terms'],
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const updateTime = await this.client.database.getDocument('bot', 'settings').then(s => s.telephoneRulesUpdate);
    const rulesInformation = Object.keys(this.client.localization.locales['en-gb'])
      .filter(key => key.startsWith('telephone.rules.'))
      .map(key => `${this.dot} ${context.__(key)}`)
      .join('\n');

    const embed = new RichEmbed()
      .setDescription(rulesInformation)
      .setFooter(context.__('telephone.rulesUpdate'))
      .setTimestamp(new Date(updateTime));

    context.reply(context.__('telephone.rules'), { embed });
  }
}

class TextSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'text',
      category: 'telephone',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const current = subscription.textable;
    if (current) {
      await this.client.database.updateDocument('telephone', context.message.channel.id, { textable: false });
      context.replySuccess(context.__('telephone.text.disabled'));
    } else {
      await this.client.database.updateDocument('telephone', context.message.channel.id, { textable: true });
      context.replySuccess(context.__('telephone.text.enabled'));
    }
  }
}

class ChangeSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'change',
      aliases: ['changenumber'],
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    if (!this.client.other.isDonator(context.message.author.id)) return context.replyError(context.__('global.donatorsOnly'));

    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));
    if (subscription.subscriber !== context.message.author.id) return context.replyWarning(context.__('telephone.change.notOwner'));

    const number = context.args[0];
    if (!number) return context.replyError(context.__('telephone.change.noNumber'));
    if (!/^[a-zA-Z\d]{3}-[a-zA-Z\d]{3}$/.test(number) || number === '000-000') return context.replyWarning(context.__('telephone.change.wrongFormat'));

    const checkAvailability = await this.client.database.findDocuments('telephone', { number });
    if (checkAvailability.length > 0) return context.replyWarning(context.__('telephone.change.alreadyExists', { number }));

    await this.client.database.updateDocument('telephone', subscription.id, { number });
    context.replySuccess(context.__('telephone.change.success', { number }));
  }
}

class HistorySubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'history',
      aliases: ['log'],
      category: 'telephone',
      dm: true,
    });
  }

  async execute(context) {
    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));
    if (!subscription.history || subscription.history.length === 0) return context.replyError(context.__('telephone.history.empty'));

    const pageCount = Math.ceil(subscription.history.length / 10);
    const pages = [];
    for (let i = 0; i < pageCount; i += 1) {
      pages.push({
        title: ' ',
        footer: context.__('telephone.history.footer', { pageCount: `${i + 1}/${pageCount}`, total: subscription.history.length }),
      });
    }

    const entries = [];
    for (const entry of subscription.history.sort((a, b) => b.time - a.time)) {
      const time = moment(entry.time)
        .locale(context.settings.misc.locale)
        .tz(context.settings.misc.timezone)
        .format(context.__('telephone.history.timeFormat'));
      const user = entry.user ?
        await this.client.fetchUser(entry.user).then(u => `**${u.username}**#${u.discriminator}`) :
        null;

      entries.push(`\`${time}\` ${this.getIcon(entry.action)} ${context.__(`telephone.history.action.${entry.action}`, { user, number: entry.number.map(n => `**${n}**`).join(', ') })}`);
    }

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('telephone.history.main', { name: context.message.guild ? `**#${context.message.channel.name}**` : `**${context.__('global.dm')}**` }),
      pages,
      entries,
    );
  }

  getIcon(action) {
    return this.client.constants.historyIcons[action] || '❔';
  }
}

module.exports = TelephoneCommand;
