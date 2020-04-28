/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');
const wait = require('util').promisify(setTimeout);

class Radio {
  constructor(client, message, voiceChannel, frequency) {
    if (client.radios.radios.find((r) => r.voiceChannel.id === voiceChannel.id)) {
      throw new Error('existingRadio');
    }

    /**
     * Client that instantied this radio
     * @type {DiscordClient}
     */
    this.client = client;

    /**
     * Author's message
     * @type {Message}
     */
    this.authorMessage = message;

    /**
     * UI's message
     * @type {?Message}
     */
    this.message = null;

    /**
     * The voice channel this radio is linked to
     * @type {VoiceChannel}
     */
    this.voiceChannel = voiceChannel;

    /**
     * Frequency this radio is tuned into
     * @type {number}
     */
    this.frequency = frequency || 875;

    /**
     * Number of times the embed was refreshed by interval
     * @type {number}
     */
    this.refreshes = 0;

    /**
     * Whether ignore the next interval
     * @type {boolean}
     */
    this.ignoreNext = true;

    /**
     * Current Lavalink playing track
     * @type {?string}
     */
    this.track = null;

    client.radios.radios.push(this);
  }

  /**
   * Player that belongs to this radio
   * @type {?Player}
   */
  get player() {
    return this.client.lavacordManager.players.get(this.authorMessage.guild.id);
  }

  /**
   * Length of a radio UI line
   * @type {number}
   */
  get lineLength() {
    return this.client.radios.lineLength;
  }

  /**
   * No programme noise URL
   * @type {string}
   */
  get noProgramme() {
    return this.client.radios.noProgramme;
  }

  /**
   * Reaction-based actions user can do
   * @type {object}
   */
  get actions() {
    return this.client.radios.actions;
  }

  /**
   * Shortcut to author's message translator
   * @param  {...any} args Arguments to pass
   * @returns {string}
   */
  _(...args) {
    return this.authorMessage._(...args);
  }

  /**
   * Shortcut to Message#emote
   * @param  {...any} args Arguments to pass
   * @returns {string}
   */
  emote(...args) {
    return this.authorMessage.emote(...args);
  }

  /**
   * Initializes the radio
   * @returns {Promise<void>}
   */
  async init() {
    if (this.voiceChannel.permissionsFor(this.client.user).missing(['CONNECT', 'SPEAK']).length) {
      throw new Error('missingPermissions');
    }

    await this.client.lavacordManager.join({
      guild: this.authorMessage.guild.id,
      channel: this.voiceChannel.id,
      node: this.client.lavacordManager.idealNodes[0].id,
    });

    const embed = await this.generateEmbed();
    const m = this.message = await this.authorMessage.send(this._('radio.header'), embed);

    (async function react(e) {
      for (let i = 0; i < e.length; i += 1) {
        try { await m.react(e[i]); } catch (_) { break; }
      }
    }(Object.keys(this.actions)));

    await this.setFrequency();
  }

  /**
   * Updates a message with up-to-date information
   * @param {?boolean} action Whether this was caused by an action
   * @param {?string} ps Whether set a custom Program Service
   * @returns {Promise<void>}
   */
  async updateMessage(action = false, ps) {
    if (!this.player || (this.message && this.message.deleted)) return;

    if (action) this.ignoreNext = true;
    else if (this.ignoreNext) {
      this.ignoreNext = false;
      return;
    }

    const embed = await this.generateEmbed(!action, ps);
    await this.message.edit(this._('radio.header'), embed);
  }

  /**
   * Sets the player to the specified frequency
   * @param {?number} frequency Frequency
   * @returns {Promise<void>}
   */
  async setFrequency(frequency = this.frequency) {
    if (frequency > 1080) frequency = 875;
    else if (frequency < 875) frequency = 1080;
    this.frequency = frequency;

    const radio = await this.client.radios.getRadio(frequency)
      || ({ stream: this.noProgramme });

    let track = await this.client.lavacordManager.getTracks(radio.stream)
      .then((r) => (r[0] ? r[0].track : null));
    if (!track) {
      track = await this.client.lavacordManager.getTracks(this.noProgramme)
        .then((r) => r[0].track);
    }

    if (track !== this.track) {
      await this.player.play(track, {
        noReplace: false,
        volume: this.authorMessage.settings.volume,
      });
    }

    this.track = track;
  }

  /**
   * Updates radio's volume
   * @param {number} volume Volume to set
   * @returns {Promise<void>}
   */
  async setVolume(volume) {
    if (volume < 0) volume = 0;
    else if (volume > 100) volume = 100;
    await this.player.volume(volume);
    await this.client.settings.setVolume(this.authorMessage.guild.id, volume);
  }

  /**
   * Seeks forward (unless backward = true)
   * @param {boolean} backward Whether to seek backward
   * @returns {Promise<void>}
   */
  async seek(backward = false) {
    await this.updateMessage(true, 'SEEKING');
    await wait(2000);

    const frequencies = await this.client.radios.getRows()
      .then((rows) => rows.sort((a, b) => a.frequency - b.frequency).map((r) => r.frequency));

    let frequency = this.frequency + (backward ? (-1) : 1);
    while (frequency !== this.frequency) {
      if (frequency < 875) frequency = 1080;
      else if (frequency > 1080) frequency = 875;

      if (frequencies.includes(frequency)) break;

      if (backward) frequency -= 1;
      else frequency += 1;
    }

    await this.setFrequency(frequency);
  }

  /**
   * Generates a Message embed with up-to-date information
   * @param {?boolean} interval Whether this call was made by setInterval
   * @param {?string} ps Custom Program Service to set
   * @returns {Promise<MessageEmbed>}
   */
  async generateEmbed(interval = false, ps) {
    const embed = new MessageEmbed();
    const lines = [];
    const frequency = (this.frequency / 10).toFixed(1);

    // Line 1 - Frequency and Program Service
    const radio = await this.client.radios.getRadio(this.frequency) || ({ ps: 'NOSIGNAL' });
    lines.push(this.generateLine(` ${frequency.length < 5 ? ' ' : ''}${frequency}   ${ps || radio.ps}`));

    // Line 2 - Playing information
    const playing = radio.id ? await this.client.radios.nowPlaying(radio.id) : null;
    lines.push(this.generateLine(playing ? playing[this.refreshes % playing.length] : '', true));

    // Line 3 - Blank line
    lines.push(this.generateLine());

    // Line 4 - Volume
    let volume = 'VOLUME ';
    for (let i = 0; i < Math.floor(this.player.state.volume / 10); i += 1) {
      volume = `${volume.substring(0, 7 + i)}X${volume.substring(8 + i)}`;
    }
    lines.push(this.generateLine(volume));

    // Line 5 - Clock
    const clock = moment().tz(this.authorMessage.settings.timezone).format('HH:mm');
    lines.push(this.generateLine(clock, true));

    embed.setDescription(lines.join('\n'));
    embed.setFooter(this._('radio.footer'));

    if (interval) this.refreshes += 1;
    return embed;
  }

  /**
   * Generates a digital display with the provided content
   * @param {?string} content Content to display
   * @param {?boolean} center Whether center content
   * @returns {string}
   */
  generateLine(content = '', center = false) {
    const line = Array(17).fill(this.emote('off', true));

    if (center) {
      content = content
        .padStart(content.length + Math.floor((this.lineLength - content.length) / 2), ' ')
        .padEnd(this.lineLength, ' ');
    }

    let i = 0;
    let j = 0;
    while (i < content.length) {
      const char = content[i];
      if (!char || char === '.' || char === ' ') {
        i += 1;
        if (char === ' ') j += 1;
        continue;
      }
      const dot = Number.isNaN(Number(char)) ? false : (content[i + 1] === '.');
      const e = ['char', 'digit', 'letter'].map((t) => this.emote(`${t}_${char.normalize('NFD')[0].toLowerCase()}${dot ? 'd' : ''}`, true));
      line[j] = e[0] || e[1] || e[2] || this.emote('off', true);
      i += 1;
      j += 1;
    }

    return line.join('');
  }

  /**
   * Handles an action and performs it
   * @param {string} action Action to perform (emoji)
   * @returns {void}
   */
  async handleAction(action) {
    const fn = this.actions[action];
    if (fn) {
      await fn(this);
      if (action !== '⏹️') await this.updateMessage(true);
    }
  }

  /**
   * Destroys gracefully the radio
   * @returns {Promise<void>}
   */
  async destroyRadio() {
    if (this.authorMessage.deletable) this.authorMessage.delete();
    if (this.message && this.message.deletable) this.message.delete();
    await this.client.lavacordManager.leave(this.authorMessage.guild.id);

    const index = this.client.radios.radios.findIndex(
      (r) => r.voiceChannel.id === this.voiceChannel.id,
    );
    if (index >= 0) this.client.radios.radios.splice(index, 1);
  }
}

module.exports = Radio;
