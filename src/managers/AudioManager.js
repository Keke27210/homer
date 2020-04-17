const Manager = require('./Manager');

/**
 * @typedef {object} Session
 * @property {string} channel Voice channel ID
 * @property {string} author Author of this session
 * @property {string} guild Voice channel's guild ID
 * @property {number} radio ID of the radio being played
 * @property {number} volume Player volume (in percentage)
 * @property {boolean} boost Bitrate boost enabled
 * @property {number} created Session creation date
 */

class AudioManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Active audio sessions
     * @type {Session[]}
     */
    this.sessions = [];

    /**
     * Default bitrate (in kbps)
     * @type {number}
     */
    this.defaultBitrate = 56;

    /**
     * Boosted bitrate (in kbps)
     * @type {number}
     */
    this.boostedBitrate = 128;

    this.client.setInterval(() => this.leaveInactive(), 30000);
  }

  /**
   * Creates an audio session
   * @param {string} channel Voice channel ID
   * @param {string} author Session's author
   * @param {string} id ID of the radio to stream
   * @param {number} volume Volume to play at (percentage)
   * @param {boolean} boost Bitrate boost (56kbps -> 128kbps)
   * @returns {Promise<StreamDispatcher>}
   */
  async createSession(channel, author, id, volume, boost = false) {
    const voice = this.client.channels.resolve(channel);
    if (!voice || voice.type !== 'voice') throw new Error('UNKNOWN_CHANNEL');

    let connection = voice.guild.voice ? voice.guild.voice.connection : null;
    if (!connection || connection.channel.id !== channel) {
      if (!voice.joinable) throw new Error('CANNOT_JOIN');
      connection = await voice.join();
    }

    const active = this.sessions.find((s) => s.guild === voice.guild.id);
    if (active) await this.destroySession(active.channel, false);

    const radio = await this.client.radios.getRow(id);
    if (!radio) throw new Error('UNKNOWN_RADIO');

    const dispatcher = connection.play(radio.stream, {
      volume: (volume / 100).toFixed(2),
      bitrate: boost ? this.boostedBitrate : this.defaultBitrate,
    });

    this.sessions.push({
      channel,
      author,
      guild: voice.guild.id,
      radio: radio.id,
      volume,
      boost,
      created: Date.now(),
    });

    return dispatcher;
  }

  /**
   * Destroys a voice session
   * @param {number} id Session channel ID
   * @param {boolean} leave Whether leave voice channel
   * @returns {Promise<void>}
   */
  async destroySession(id, leave = false) {
    const voice = this.client.channels.resolve(id);
    if (!voice || voice.type !== 'voice') throw new Error('UNKNOWN_CHANNEL');

    const index = this.sessions.findIndex((s) => s.channel === id);
    if (index >= 0) this.sessions.splice(index, 1);

    if (leave) {
      if (!voice.guild.voice) throw new Error('NO_VOICE_STATE');

      const { connection } = voice.guild.voice;
      if (connection) {
        connection.disconnect();
        await voice.leave();
      }
    }

    return null;
  }

  /**
   * Leaves all voice channels where only the bot is on
   * @returns {Promise<void>}
   */
  async leaveInactive() {
    const inactive = this.client.voice.connections
      .filter((c) => c.channel.members.size === 1)
      .array();
    for (let i = 0; i < inactive.length; i += 1) {
      const session = this.sessions.find((s) => s.channel === inactive[i].channel.id);
      if (session) await this.destroySession(session.id, true);
      else await inactive[i].disconnect();
    }
  }
}

module.exports = AudioManager;
