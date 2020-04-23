const { inspect } = require('util');

const Command = require('../../structures/Command');

class TuneCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'tune',
    });
  }

  async main(message, args) {
    const voice = this.client.channels.resolve(message.settings.radio);
    if (!voice) {
      message.warn(message._('radio.unknown'));
      return 0;
    }

    const { channelID } = message.member.voice;
    if (channelID !== voice.id) {
      message.error(message._('tune.none', voice.name));
      return 0;
    }

    let [frequency] = args;
    if (!frequency) {
      message.error(message._('tune.missing'));
      return 0;
    }

    frequency = Number(frequency);
    if (Number.isNaN(frequency)) {
      message.error(message._('tune.invalid'));
      return 0;
    }

    const radio = await this.client.radios.getRadio(frequency);
    if (!radio) {
      message.warn(message._('tune.unknown', frequency));
      return 0;
    }

    const m = await message.loading(message._('tune.tuning', radio.frequency));

    const track = await this.client.lavacordManager.getTracks(radio.stream)
      .then((r) => r[0]);
    if (!track) {
      m.editError(message._('tune.error'));
      this.client.logger.error(`[lavacord->getTrack] Couldn't get track for radio ${radio.id}`);
      return 1;
    }

    (async () => {
      const existing = this.client.lavacordManager.players.get(message.guild.id);
      if (existing) {
        await existing.stop();
        await existing.destroy();
        this.client.lavacordManager.players.delete(message.guild.id);
      }

      const player = await this.client.lavacordManager.join({
        guild: message.guild.id,
        channel: voice.id,
        node: this.client.lavacordManager.idealNodes[0].id,
      });

      player.radio = radio.id;
      this.client.lavacordManager.players.set(message.guild.id, player);

      player.once('start', () => {
        m.edit(message._('tune.playing', radio.name));
      });

      player.once('error', (error) => {
        if (error.code === 1000) return;
        this.client.logger.error(`[lavalink->broadcast] Broadcast error - Radio: ${radio.id} - Channel: ${voice.id}\n${inspect(error)}`);
        m.editError(message._('tune.error'));
      });

      await player.play(track.track, { volume: message.settings.volume });
    })()
      .catch((error) => {
        this.client.logger.error(`[commands->tune] Error while tuning on ${radio.id} in ${voice.id}`, error);
        m.editError(message._('tune.error'));
      });

    m.delete({ timeout: 10e3 });
    if (message.deletable) message.delete({ timeout: 10e3 });
    return 0;
  }
}

module.exports = TuneCommand;
