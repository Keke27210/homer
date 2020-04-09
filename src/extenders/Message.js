const { MessageEmbed, Structures } = require('discord.js');
const moment = require('moment-timezone');

const emotes = {
  // Status/Prefix emotes
  homer: '695734221322584155',
  human: '👤',
  bot: '695746485790310530',
  status: {
    online: '695746507231461469',
    idle: '695749338877395069',
    dnd: '695749383639138414',
    offline: '695749413704040478',
  },
  loading: '696020151727947866',
  success: '695722112823853066',
  warn: '695722124395937862',
  error: '695722118976897085',
  info: 'ℹ️',
  placeholder: '695983847061323797',
  verified: '697804778910253086',

  // User flags
  developer: '697441287921467432',
  owner: '695975441516855337',
  donator: '697439375847456818',
  nitro: '695977635666198570',
  DISCORD_EMPLOYEE: '697537107505446962',
  DISCORD_PARTNER: '697536791192010933',
  HYPESQUAD_EVENTS: '697539960592400485',
  BUGHUNTER_LEVEL1: '697534883115040838',
  HOUSE_BRAVERY: '697534635755700224',
  HOUSE_BRILLANCE: '697534618617774160',
  HOUSE_BALANCE: '697533287870103596',
  EARLY_SUPPORTER: '697538498873393153',
  TEAM_USER: '👥',
  SYSTEM: '442415945647128585',
  BUGHUNTER_LEVEL2: '697534883115040838',
  VERIFIED_BOT: '697824845215301642',
  VERIFIED_DEVELOPER: '697803716597645363',

  // Help categories
  c_bot: '474150825929998337',
  c_general: '🖥',
  c_radio: '📻',
  c_settings: '🔧',
  c_telephone: '📞',
};

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
       * IDs of emotes used by Homer
       * @type {object}
       */
      this.emotes = emotes;
    }

    get eInfo() {
      return this.emotes.info;
    }

    get eSuccess() {
      return this.client.emojis.resolve(this.emotes.success).toString();
    }

    get eWarn() {
      return this.client.emojis.resolve(this.emotes.warn).toString();
    }

    get eError() {
      return this.client.emojis.resolve(this.emotes.error).toString();
    }

    get eLoading() {
      return this.client.emojis.resolve(this.emotes.loading).toString();
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
     * Gets a sendable emote
     * @param {string} name Emote name
     * @param {boolean} status Status emote
     * @returns {string} Emote
     */
    emote(name, status = false) {
      const id = status ? this.emotes.status[name] : this.emotes[name];
      const e = this.client.emojis.resolve(id);
      if (!e) return id;
      return e.toString();
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
     * Reacts a success emote
     * @returns {Promise<MessageReaction>}
     */
    async reactSuccess() {
      return this.react(this.client.emojis.resolveIdentifier(this.emotes.success));
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
     * Calls TextChannel#send with a ℹ️ before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    info(content, options) {
      const str = `${this.eInfo} ${content}`;
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
     * Calls Message#edit with a ℹ️ before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editInfo(content, options) {
      const str = `${this.eInfo} ${content}`;
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
    // eslint-disable-next-line class-methods-use-this
    getEmbed() {
      const embed = new MessageEmbed();
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
        .locale(this.settings.locale);
      return `**${m.format(this.settings.date)}** ${this._('global.at')} **${m.format(this.settings.time)}**`;
    }

    /**
     * Returns a nicely formatted duration
     * @param {Date} date Date to compare
     * @param {?boolean} ffix Whether hide (pre|su)ffix
     */
    getDuration(date, ffix = false) {
      const m = moment(date)
        .tz(this.settings.timezone)
        .locale(this.settings.locale);
      if (Date.now() > new Date(date).getTime()) {
        return m.fromNow(ffix);
      }
      return m.toNow(ffix);
    }

    /**
     * Waits for approval or denial from the specified user
     * @param {string} id User ID
     * @returns {Promise<boolean>} User's decision
     */
    async awaitUserApproval(id) {
      const e = [
        this.client.emojis.resolveIdentifier(this.emotes.success),
        this.client.emojis.resolveIdentifier(this.emotes.error),
      ];
      await this.react(e[0]).catch(() => null);
      await this.react(e[1]).catch(() => null);
      return this.awaitReactions(
        (reaction, user) => e.includes(reaction.emoji.identifier)
          && user.id === id,
        { max: 1 },
      )
        .then((reactions) => {
          if (this.guild && this.guild.me.permissions.has('MANAGE_MESSAGES')) this.reactions.removeAll();
          const r = reactions.first();
          if (r.emoji.identifier === e[0]) {
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
