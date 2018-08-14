const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class FormatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'format',
      userPermissions: ['MANAGE_GUILD'],
      children: [new DateSubcommand(client), new TimeSubcommand(client)],
      category: 'settings',
      dm: true,
    });
  }

  async execute(context) {
    const formatInformation = [
      `${context.__('format.embed.explanation', { prefix: this.client.prefix })}`,
      '',
      `${this.dot} ${context.__('format.embed.date')}: **${context.settings.misc.dateFormat}**`,
      `${this.dot} ${context.__('format.embed.time')}: **${context.settings.misc.timeFormat}**`,
      '',
      `${this.dot} ${context.__('format.embed.example')}: **${context.formatDate(Date.now())}**`,
      `${this.dot} ${context.__('format.embed.documentation')}: **[moment.js](https://momentjs.com/docs/#/displaying/format/)**`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(formatInformation);

    context.reply(
      context.__('format.title', { name: context.message.guild ? `**${context.message.guild.name}**` : `**${context.message.author.username}**#${context.message.author.discriminator}` }),
      { embed },
    );
  }
}

class DateSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'date',
      userPermissions: ['MANAGE_GUILD'],
      category: 'settings',
      usage: '<format>',
      dm: true,
    });
  }

  async execute(context) {
    const format = context.args.join(' ');
    if (!format) return context.replyError(context.__('format.date.noFormat'));
    if (format.length > 64) return context.replyWarning(context.__('format.date.tooLong'));

    context.settings.misc.dateFormat = format;
    await context.saveSettings();
    context.replySuccess(context.__('format.date.set', { format }));
  }
}

class TimeSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'time',
      userPermissions: ['MANAGE_GUILD'],
      category: 'settings',
      usage: '<format>',
      dm: true,
    });
  }

  async execute(context) {
    const format = context.args.join(' ');
    if (!format) return context.replyError(context.__('format.time.noFormat'));
    if (format.length > 64) return context.replyWarning(context.__('format.time.tooLong'));

    context.settings.misc.timeFormat = format;
    await context.saveSettings();
    context.replySuccess(context.__('format.time.set', { format }));
  }
}

module.exports = FormatCommand;
