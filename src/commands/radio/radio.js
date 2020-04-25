/* eslint-disable no-param-reassign */
const Command = require('../../structures/Command');

class ChannelSubCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'channel',
      userPermissions: ['MANAGE_GUILD'],
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
      message.error(message._('radio.channel.none'));
      return 0;
    }

    const ret = await this.client.settings.setRadio(message.settings.id, channel.id)
      .then(() => {
        message.success(message._('radio.channel.set', channel.name));
        return 0;
      })
      .catch(() => {
        message.error(message._('radio.channel.error'));
        return 1;
      });

    return ret;
  }
}

class RadioCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'radio',
      children: [new ChannelSubCommand(client, category)],
    });
  }

  async main(message, [frequency]) {
    frequency = Number(frequency);
    if (Number.isNaN(frequency)) frequency = 87.5;
    if (frequency < 87.5 || frequency > 108) frequency = 87.5;
    frequency = frequency.toFixed(1);

    const channel = message.guild.channels.resolve(message.settings.radio);
    if (!channel) return message.warn(message._('radio.unset'));

    const { voice } = message.member;
    if (!voice || voice.channelID !== channel.id) return message.error(message._('radio.notin', channel.name));

    const existing = this.client.lavacordManager.players.get(message.guild.id);
    if (existing) return message.warn(message._('radio.instance'));

    const player = await this.client.lavacordManager.join({
      channel: channel.id,
      guild: message.guild.id,
      node: this.client.lavacordManager.idealNodes[0].id,
    });

    player.setup(message, frequency);
    return 0;
  }
}

module.exports = RadioCommand;
