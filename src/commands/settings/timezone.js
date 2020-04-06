const moment = require('moment-timezone');

const Command = require('../../structures/Command');

class ListSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'list',
      dm: true,
    });
  }

  main(message) {
    const list = moment.tz.names();
    // Build menu here
  }
}

class TimezoneCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'timezone',
      children: [new ListSubcommand(client, category)],
      dm: true,
    });
  }

  async main(message, args) {
    const [timezone] = args;
    if (!timezone) {
      message.error(message._('timezone.none'));
      return 0;
    }

    if (timezone.length > this.client.settings.maxTimezoneLength) {
      message.error(message._('timezone.length', this.client.settings.maxTimezoneLength));
      return 0;
    }

    if (!moment.tz.names().includes(timezone)) {
      message.error(message._('timezone.invalid', timezone));
      return 0;
    }

    const ret = await this.client.settings.setTimezone(this.settings.id, timezone)
      .then(() => {
        message.success(message._('timezone.set', timezone, message.getMoment()));
        return 0;
      })
      .catch(() => {
        message.error(message._('timezone.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = TimezoneCommand;
