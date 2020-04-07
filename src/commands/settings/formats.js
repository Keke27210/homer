const moment = require('moment-timezone');

const Command = require('../../structures/Command');

class DateSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'date',
      dm: true,
    });
  }

  async main(message, args) {
    const format = args.join(' ');
    if (!format) {
      message.error(message._('formats.missing'));
      return 0;
    }

    if (format.length > this.client.settings.maxFormatLength) {
      message.error(message._('formats.length', this.client.settings.maxFormatLength));
      return 0;
    }

    const ret = await this.client.settings.setFormats(message.settings.id, format)
      .then(() => {
        const now = moment()
          .tz(message.settings.timezone)
          .locale(message.locale)
          .format(message.settings.date);
        message.success(message._('formats.date.set', now));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[formats->date] Error while setting date format "${format}" for context ${message.settings.id}`, error);
        message.error(message._('formats.error'));
        return 1;
      });

    return ret;
  }
}

class TimeSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'time',
      dm: true,
    });
  }

  async main(message, args) {
    const format = args.join(' ');
    if (!format) {
      message.error(message._('formats.missing'));
      return 0;
    }

    if (format.length > this.client.settings.maxFormatLength) {
      message.error(message._('formats.length', this.client.settings.maxFormatLength));
      return 0;
    }

    const ret = await this.client.settings.setFormats(message.settings.id, null, format)
      .then(() => {
        const now = moment()
          .tz(message.settings.timezone)
          .locale(message.locale)
          .format(message.settings.time);
        message.success(message._('formats.time.set', now));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[formats->time] Error while setting time format "${format}" for context ${message.settings.id}`, error);
        message.error(message._('formats.error'));
        return 1;
      });

    return ret;
  }
}

class FormatsCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'formats',
      children: [
        new DateSubcommand(client, category),
        new TimeSubcommand(client, category),
      ],
      dm: true,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async main(message) {
    const now = moment()
      .tz(message.settings.timezone)
      .locale(message.locale);
    const [date, time] = [now.format(message.settings.date), now.format(message.settings.time)];

    const description = [
      `${message.dot} ${message._('formats.fdate')}: \`${message.settings.date}\` - Preview: **${date}**`,
      `${message.dot} ${message._('formats.ftime')}: \`${message.settings.time}\` - Preview: **${time}**`,
      '',
      `${message.dot} ${message._('formats.documentation')}: **[moment.js](https://momentjs.com/docs/#/displaying/)**`,
      `${message.emote('placeholder')} ${message._('formats.hint')}`,
    ].join('\n');

    const embed = message.getEmbed()
      .setDescription(description);
    message.send(message._('formats.title'), embed);
  }
}

module.exports = FormatsCommand;
