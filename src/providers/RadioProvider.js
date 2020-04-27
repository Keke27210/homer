const fetch = require('node-fetch');

const Provider = require('./Provider');
const Radio = require('../structures/Radio');

const TABLE_COLUMNS = [
  ['id', 'SERIAL', 'PRIMARY KEY'],
  ['frequency', 'INT', 'UNIQUE NOT NULL'],
  ['name', 'VARCHAR(40)', 'NOT NULL'],
  ['ps', 'VARCHAR(8)', 'NOT NULL'], // Program Service - 8 chars to display station's name
  ['stream', 'TEXT', 'NOT NULL'],
  ['pty', 'INT', null],
  ['emote', 'VARCHAR(20)', null],
  ['website', 'TEXT', null],
  ['language', 'VARCHAR(20)', null],
  ['country', 'VARCHAR(20)', null],
  ['radionet', 'INT', null],
  ['updated', 'TIMESTAMP', null],
  ['created', 'TIMESTAMP', 'NOT NULL'],
];

class RadioProvider extends Provider {
  constructor(client) {
    super(client, 'radios', TABLE_COLUMNS);

    /**
     * Active radio instances
     * @type {Radio[]}
     */
    this.radios = [];

    /**
     * Playing cache
     * @type {Playing[]}
     */
    this.playing = [];

    /**
     * Length of a radio UI line
     * @type {number}
     */
    this.lineLength = 17;

    /**
     * Sweep interval for playing information
     * @type {number}
     */
    this.sweepInterval = 30 * 1000;

    /**
     * Update interval for radio messages
     * @type {number}
     */
    this.updateInterval = 5 * 1000;

    /**
     * Actions a user can perform on a radio
     * @type {object}
     */
    this.actions = {
      '🔉': (radio) => radio.setVolume(radio.player.state.volume - 10),
      '⏪': (radio) => radio.seek(true),
      '◀️': (radio) => radio.setFrequency(radio.frequency - 1),
      '⏹️': (radio) => radio.destroyRadio(),
      '▶️': (radio) => radio.setFrequency(radio.frequency + 1),
      '⏩': (radio) => radio.seek(),
      '🔊': (radio) => radio.setVolume(radio.player.state.volume + 10),
    };

    /**
     * Audio stream played when no radio available (white noise)
     * @type {string}
     */
    this.noProgramme = 'https://raw.githubusercontent.com/Keke27210/homer_cdn/master/assets/radios/NO_PROGRAMME.mp3';

    this.client.on('voiceStateUpdate', this.voiceStateUpdate.bind(this));
    this.client.on('messageReactionAdd', this.messageReactionAdd.bind(this));
    this.client.on('messageDelete', this.messageDelete.bind(this));
    this.client.setInterval(this.interval.bind(this), this.updateInterval);
  }

  /**
   * Finds a radio using its frequency
   * @param {string} frequency Frequency
   * @returns {Promise<Radio>} Radio
   */
  async getRadio(frequency) {
    const radios = await this.getRows([
      ['frequency', '=', frequency],
    ]);
    return radios[0] || null;
  }

  /**
   * Fetches playing information from radio.net or from cache if not too old
   * @param {number} id Radio ID
   * @returns {Promise<string[]>}
   */
  async nowPlaying(id) {
    const cache = this.playing.find((p) => p.radio === id);
    if (cache && (Date.now() - cache.time) < this.sweepInterval) return cache.text;

    const api = await this.client.apis.fetchKey('radionet');
    if (!api) return null;

    const radio = await this.getRow(id);
    if (!radio) throw new Error('UNKNOWN_RADIO');
    if (!radio.radionet) return null;

    const req = await fetch(`https://api.radio.net/info/v2/search/nowplaying?apikey=${api.key}&numberoftitles=1&station=${radio.radionet}`)
      .then((r) => r.json())
      .catch(() => null);
    if (!req) return null;

    const formatted = (req[0].streamTitle || '')
      .split(' - ')
      .map((part) => {
        if (part.length > 17) return part.match(/(.{1,17})(?:\s|$)/g);
        return part;
      })
      .flat();

    if (cache) this.playing.splice(this.playing.indexOf(cache), 1);
    this.playing.push({
      radio: id,
      text: formatted,
      time: Date.now(),
    });

    return formatted;
  }

  /**
   * Creates a radio instance
   * @param {Message} message Message that instantied the radio
   * @param {VoiceChannel} voiceChannel Voice channel to use
   * @param {?number} frequency Frequency to tune into
   */
  async createRadio(message, voiceChannel, frequency) {
    if (this.radios.find((r) => r.voiceChannel.id === voiceChannel.id)) {
      throw new Error('existingRadio');
    }

    const radio = new Radio(this.client, message, voiceChannel, frequency);
    await radio.init();
  }

  /**
   * Destroys a radio instance
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  destroyRadio(radio) {
    return radio.destroyRadio();
  }

  /**
   * Handles voice state updates to destroy unused Homer radios
   * @param {VoiceState} oldState Old voice state
   * @param {VoiceState} newState New voice state
   * @returns {void}
   */
  voiceStateUpdate(oldState, newState) {
    for (let i = 0; i < this.radios.length; i += 1) {
      const radio = this.radios[i];
      if (oldState.channelID !== radio.voiceChannel.id
        && newState.channelID !== radio.voiceChannel.id) return;

      if ([this.client.user.id, radio.authorMessage.author.id].includes(newState.id)
        && oldState.channelID && !newState.channelID) this.destroyRadio(radio);
    }
  }

  /**
   * Handles message reactions to update radio instances
   * @param {MessageReaction} reaction Reaction that was added
   * @param {User} user User who reacted
   * @returns {void}
   */
  messageReactionAdd(reaction, user) {
    if (!Object.keys(this.actions).includes(reaction.emoji.name)) return;

    const radio = this.radios.find((r) => r.message && r.message.id === reaction.message.id);
    if (!radio || radio.authorMessage.author.id !== user.id) return;

    radio.handleAction(reaction.emoji.name);
    reaction.users.remove(user.id).catch(() => null);
  }

  /**
   * Handles message deletion to destroy radio if UI was deleted
   * @param {Message} message Deleted message
   * @returns {void}
   */
  messageDelete(message) {
    const radio = this.radios.find((r) => r.message && r.message.id === message.id);
    if (radio) radio.destroyRadio();
  }

  /**
   * Updates radio messages every updateInterval ms
   * @returns {void}
   */
  interval() {
    for (let i = 0; i < this.radios.length; i += 1) {
      this.radios[i].updateMessage();
    }
  }
}

module.exports = RadioProvider;
