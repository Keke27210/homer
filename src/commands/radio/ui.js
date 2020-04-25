/* eslint-disable no-param-reassign */
const Command = require('../../structures/Command');

class UiCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'ui',
      private: true,
    });
  }

  async main(message, [frequency]) {
    frequency = Number(frequency).toFixed(1);
    if (Number.isNaN(frequency) || (frequency < 87.5 && frequency > 108)) frequency = 87.5;

    const channel = message.guild.channels.resolve(message.settings.radio);
    if (!channel) return message.warn(message._('radio.unset'));

    const { voice } = message.member;
    if (!voice || voice.channelID !== channel.id) return message.error(message._('radio.channel', channel.name));

    const existing = this.client.lavacordManager.players.get(message.guild.id);
    if (existing) {
      await existing.destroy();
      this.client.lavacordManager.players.delete(message.guild.id);
    }

    const player = await this.client.lavacordManager.join({
      channel: channel.id,
      guild: message.guild.id,
      node: this.client.lavacordManager.idealNodes[0].id,
    });

    player.setup(message, frequency);
    return 0;
  }
}

module.exports = UiCommand;
