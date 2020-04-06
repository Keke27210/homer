const Command = require('../../structures/Command');

class RadioCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'radio',
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let channel = message.member.voiceChannel;
    if (search) {
      const found = this.client.finderUtil.findChannels(message, search, 'voice');
      if (!found) {
        message.error(message._('finder.channels.zero', search));
        return 0;
      }
      if (found.length > 1) {
        message.warn(this.client.finderUtil.formatChannels(message, found, search));
        return 0;
      }
      [channel] = found;
    }

    if (!channel) {
      message.error(message._('radio.none'));
      return 0;
    }

    const ret = await this.client.settings.setRadio(message.settings.id, channel.id)
      .then(() => {
        message.success(message._('radio.set', channel.name));
        return 0;
      })
      .catch(() => {
        message.error(message._('radio.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = RadioCommand;
