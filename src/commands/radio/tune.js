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

    const dispatcher = await this.client.audioManager.createSession(
      voice.id,
      message.author.id,
      radio.id,
      message.settings.volume,
      await this.client.settings.isDonator(message.author.id),
    )
      .catch((error) => {
        this.client.logger.error(`[commands->tune] Error while tuning on ${radio.id} in ${voice.id}`, error);
        m.editError(message._('tune.error'));
      });

    if (dispatcher) {
      dispatcher.once('start', () => {
        m.edit(message._('tune.playing', radio.name));
      });

      dispatcher.once('error', () => {
        this.client.logger.error(`[audio->broadcast] Broadcast error - Radio: ${radio.id} - Channel: ${voice.id}`);
        m.editError(message._('tune.error'));
      });

      dispatcher.on('debug', (info) => {
        this.client.logger.debug(`[audio->brooadcast] Radio: ${radio.id} / Channel: ${voice.id} => ${info}`);
      });
    }

    return (dispatcher ? 0 : 1);
  }
}

module.exports = TuneCommand;
