const Command = require('../../structures/Command');

class VolumeCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'volume',
    });
  }

  async main(message, args) {
    message.info(message._('radio.deprecate'));
    /* message.info(message._('radio.deprecate'));
    let [volume] = args;
    if (!volume) {
      message.error(message._('volume.missing'));
      return 0;
    }

    volume = Number(volume);
    if (Number.isNaN(volume)) {
      message.error(message._('volume.number'));
      return 0;
    }

    volume = Math.round(volume);

    if (volume < 0 || volume > 100) {
      message.warn(message._('volume.range'));
      return 0;
    }

    const ret = await this.client.settings.setVolume(message.settings.id, volume)
      .then(() => {
        const player = this.client.lavacordManager.players.get(message.guild.id);
        if (player) player.volume(volume);

        message.success(message._('volume.set', volume));
        return 0;
      })
      .catch(() => {
        message.error(message._('volume.error'));
        return 1;
      });

    return ret; */
  }
}

module.exports = VolumeCommand;
