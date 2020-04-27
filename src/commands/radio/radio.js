/* eslint-disable no-param-reassign */
const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class TutorialSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'tutorial',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async main(message) {
    const embed = new MessageEmbed()
      .setDescription(message._('radio.tutorial.list'));
    message.send(message._('radio.tutorial.title'), embed);
  }
}

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
      children: [
        new ChannelSubCommand(client, category),
        new TutorialSubcommand(client, category),
      ],
    });
  }

  async main(message, [frequency]) {
    frequency = Number(frequency) * 10;
    if (Number.isNaN(frequency)) frequency = 875;
    if (frequency > 1080) frequency = 1080;
    if (frequency < 875) frequency = 875;

    const channel = message.guild.channels.resolve(message.settings.radio);
    if (!channel) return message.warn(message._('radio.unset'));

    const { voice } = message.member;
    if (!voice || voice.channelID !== channel.id) return message.error(message._('radio.notin', channel.name));
    if (channel.permissionsFor(this.client.user).missing(['CONNECT', 'SPEAK']).length) return message.error(message._('radio.permissions', channel.name));

    const existing = this.client.radios.radios.find(
      (r) => r.authorMessage.guild.id === message.guild.id,
    );
    if (existing) return message.warn(message._('radio.instance'));

    const ret = await this.client.radios.createRadio(message, channel, frequency)
      .then(() => 0)
      .catch((error) => {
        message.error(message._('radio.error'));
        this.client.logger.error(`[Radio] Error while spawning radio for channel ${channel.id} / user ${message.author.id}`, error);
        return 1;
      });

    return ret;
  }
}

module.exports = RadioCommand;
