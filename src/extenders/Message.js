const { MessageEmbed, Structures } = require('discord.js');
const moment = require('moment-timezone');

Structures.extend('Message', (Message) => {
  class CustomMessage extends Message {
    constructor(client, data, channel) {
      super(client, data, channel);

      /**
       * dot emote used by Homer (:white_small_square:)
       * @type {string}
       */
      this.dot = '▫️';

      /**
       * Logo emote used by Homer
       * @type {string}
       */
      this.eHomer = '<:homer:695734221322584155>';

      /**
       * Bot emote used by Homer
       * @type {string}
       */
      this.eBot = '<:bot:695746485790310530>';

      /**
       * Status emotes used by Homer
       * @type {object}
       */
      this.eStatus = {
        online: '<:online:695746507231461469>',
        idle: '<:idle:695749338877395069>',
        dnd: '<:dnd:695749383639138414>',
        offline: '<:offline:695749413704040478>',
      };

      /**
       * Success emote used by Homer
       * @type {string}
       */
      this.eSuccess = '<:success:695722112823853066>';

      /**
       * Warn emote used by Homer
       * @type {string}
       */
      this.eWarn = '<:warn:695722124395937862>';

      /**
       * Error emote used by Homer
       * @type {string}
       */
      this.eError = '<:error:695722118976897085>';

      /**
       * Placeholder emote used by Homer
       * @type {string}
       */
      this.ePlaceholder = '<:placeholder:695983847061323797>';

      /**
       * Owner emote used by Homer
       * @type {string}
       */
      this.eOwner = '<:owner:695975441516855337>';

      /**
       * Nitro emote used by Homer
       * @type {string}
       */
      this.eNitro = '<:nitro:695977635666198570>';
    }

    /**
     * Settings for the current context (guild or user)
     * @type {Settings}
     */
    get settings() {
      return this.guild ? this.guild.settings : this.author.settings;
    }

    /**
     * Locale for this guild
     * @type {string}
     */
    get locale() {
      return this._('_.code');
    }

    /**
     * Calls LocaleManager#translate with the given key and arguments
     * Uses locale set into settings (or fallback language if none)
     * @param {string} key Translation key
     * @param {...any} args Arguments
     * @returns {string} Translated value
     */
    _(key, ...args) {
      return this.client.localeManager.translate(
        this.settings ? this.settings.locale : this.client.localeManager.defaultLocale,
        key,
        ...args,
      );
    }

    /**
     * Calls TextChannel#send
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     */
    send(content, options) {
      return this.channel.send(content, options);
    }

    /**
     * Calls TextChannel#send with a :success: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    success(content, options) {
      const str = `${this.eSuccess} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Calls TextChannel#send with a :warn: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    warn(content, options) {
      const str = `${this.eWarn} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Calls TextChannel#send with a :error: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    error(content, options) {
      const str = `${this.eError} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Get an embed with Homer design
     * @returns {MessageEmbed}
     */
    getEmbed() {
      const embed = new MessageEmbed();
      if (this.guild && this.guild.me.displayHexColor !== '#000000') {
        embed.setColor(this.guild.me.displayHexColor);
      }
      return embed;
    }

    /**
     * Returns a nicely formatted date
     * @param {number} time Timestamp to set moment to
     * @returns {string}
     */
    getMoment(time = Date.now()) {
      const m = moment(time)
        .tz(this.settings.timezone)
        .locale(this.locale);
      return `**${m.format(this.settings.formats.date)}** ${this._('global.at')} **${m.format(this.settings.formats.time)}**`;
    }

    /**
     * Fetches settings for the guild or user
     * @returns {Promise<Settings>}
     */
    fetchSettings() {
      return this.guild ? this.guild.fetchSettings() : this.author.fetchSettings();
    }
  }

  return CustomMessage;
});
