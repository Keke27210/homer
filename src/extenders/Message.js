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
       * Loading emote used by Homer
       * @type {string}
       */
      this.eLoadingID = '696020151727947866';

      /**
       * Success emote used by Homer
       * @type {string}
       */
      this.eSuccessID = '695722112823853066';

      /**
       * Warn emote used by Homer
       * @type {string}
       */
      this.eWarnID = '695722124395937862';

      /**
       * Error emote used by Homer
       * @type {string}
       */
      this.eErrorID = '695722118976897085';

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

    get eSuccess() {
      return this.client.emojis.resolve(this.eSuccessID).toString();
    }

    get eWarn() {
      return this.client.emojis.resolve(this.eWarnID).toString();
    }

    get eError() {
      return this.client.emojis.resolve(this.eErrorID).toString();
    }

    get eLoading() {
      return this.client.emojis.resolve(this.eLoadingID).toString();
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
     * Calls TextChannel#send with a :loading: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    loading(content, options) {
      const str = `${this.eLoading} ${content}`;
      return this.channel.send(str, options);
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
     * Calls Message#edit with a :loading: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editLoading(content, options) {
      const str = `${this.eLoading} ${content}`;
      return this.edit(str, options);
    }

    /**
     * Calls Message#edit with a :success: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editSuccess(content, options) {
      const str = `${this.eSuccess} ${content}`;
      return this.edit(str, options);
    }

    /**
     * Calls Message#edit with a :warn: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editWarn(content, options) {
      const str = `${this.eWarn} ${content}`;
      return this.edit(str, options);
    }

    /**
     * Calls Message#edit with a :error: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editError(content, options) {
      const str = `${this.eError} ${content}`;
      return this.edit(str, options);
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
     * Waits for approval or denial from the specified user
     * @param {string} id User ID
     * @returns {Promise<boolean>} User's decision
     */
    async awaitUserApproval(id) {
      const emotes = [
        this.client.emojis.resolveIdentifier(this.eSuccessID),
        this.client.emojis.resolveIdentifier(this.eErrorID),
      ];
      await this.react(emotes[0]).catch(() => null);
      await this.react(emotes[1]).catch(() => null);
      return this.awaitReactions(
        (reaction, user) => emotes.includes(reaction.emoji.identifier)
          && user.id === id,
        { max: 1 },
      )
        .then((reactions) => {
          if (this.guild) this.reactions.removeAll();
          const r = reactions.first();
          if (r.emoji.identifier === emotes[0]) {
            return true;
          }
          return false;
        })
        .catch((error) => {
          this.client.logger.warn(`[message->${this.id}] Error while asking user approval`, error);
          return false;
        });
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
