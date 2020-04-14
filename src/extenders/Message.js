const { MessageEmbed, Structures } = require('discord.js');
const moment = require('moment-timezone');

const emotes = {
  // Status/Prefix emotes
  homer: '<:homer:695734221322584155>',
  human: '👤',
  bot: '<:bot:695746485790310530>',
  status: {
    online: '<:online:695746507231461469>',
    idle: '<:idle:695749338877395069>',
    dnd: '<:dnd:695749383639138414>',
    offline: '<:offline:695749413704040478>'
  },
  loading: '<a:loading:696020151727947866>',
  success: '<:success:695722112823853066>',
  warn: '<:warn:695722124395937862>',
  error: '<:error:695722118976897085>',
  successIdentifier: 'success:695722112823853066',
  errorIdentifier: 'error:695722118976897085',
  info: 'ℹ️',
  placeholder: '<:placeholder:695983847061323797>',
  verified: '<:verified:697804778910253086>',
  activities: '<:activities:698065014321446922>',

  // User flags
  developer: '<:developer:697441287921467432>',
  owner: '<:owner:695975441516855337>',
  donator: '<:donator:697439375847456818>',
  nitro: '<:nitro:695977635666198570>',
  DISCORD_EMPLOYEE: '<:staff:697537107505446962>',
  DISCORD_PARTNER: '<:partner:697536791192010933>',
  HYPESQUAD_EVENTS: '<:hypesquad_events:697539960592400485>',
  BUGHUNTER_LEVEL1: '<:bughunter:697534883115040838>',
  HOUSE_BRAVERY: '<:bravery:697534635755700224>',
  HOUSE_BRILLIANCE: '<:brilliance:697534618617774160>',
  HOUSE_BALANCE: '<:balance:697533287870103596>',
  EARLY_SUPPORTER: '<:early_supporter:698886219358142536>',
  TEAM_USER: '👥',
  SYSTEM: '<:discord:442415945647128585>',
  BUGHUNTER_LEVEL2: '<:bughunter:697534883115040838>',
  VERIFIED_BOT: '<:verified_bot:697824845215301642>',
  VERIFIED_DEVELOPER: '<:verified_developer:697803716597645363>',

  // Help categories
  c_bot: '<:homer:695734221322584155>',
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
      return this.emotes.success;
    }

    get eWarn() {
      return this.emotes.warn;
    }

    get eError() {
      return this.emotes.error;
    }

    get eLoading() {
      return this.emotes.loading;
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
      return id;
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
      return this.react(this.emotes.successIdentifier);
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
      const e = [this.emotes.successIdentifier, this.emotes.errorIdentifier];
      await this.react(e[0]).catch(() => null);
      await this.react(e[1]).catch(() => null);
      return this.awaitReactions(
        (reaction, user) => e.includes(reaction.emoji.identifier)
          && user.id === id,
        { max: 1 },
      )
        .then((reactions) => {
          if (this.guild && this.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
            this.reactions.removeAll();
          }
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
