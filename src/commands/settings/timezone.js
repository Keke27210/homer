const moment = require('moment-timezone');

const Command = require('../../structures/Command');

class ListSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'list',
      dm: true,
    });
  }

  main(message, args) {
    const [search] = args;
    const list = search
      ? moment.tz.names().filter((z) => z.toLowerCase().includes(search.toLowerCase()))
      : moment.tz.names();

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('timezone.list.title'),
      null,
      list.map((l) => `${message.dot} \`${l}\``),
      { footer: message._('timezone.list.footer') },
    );
  }
}

class TimezoneCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'timezone',
      children: [new ListSubcommand(client, category)],
      userPermissions: ['MANAGE_GUILD'],
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

    const ret = await this.client.settings.setTimezone(message.settings.id, timezone)
      .then(() => {
        message.success(message._('timezone.set', timezone, message.getMoment()));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[command->timezone] Error while setting timezone ${timezone} for settings ID ${message.settings.id}`, error);
        message.error(message._('timezone.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = TimezoneCommand;
