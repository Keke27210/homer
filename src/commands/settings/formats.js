const moment = require('moment-timezone');

const Command = require('../../structures/Command');

class FormatsCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'formats',
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
      `${message.dot} ${message._('formats.date')}: \`${message.settings.date}\` - Preview: **${date}**`,
      `${message.dot} ${message._('formats.time')}: \`${message.settings.time}\` - Preview: **${time}**`,
      '',
      `${message.dot} ${message._('formats.documentation')}: **[moment.js](https://momentjs.com/docs/#/displaying/)**`,
      message._('formats.hint'),
    ].join('\n');

    const embed = message.getEmbed()
      .setDescription(description);
    message.send(message._('formats.title'), embed);
  }
}

module.exports = FormatsCommand;
