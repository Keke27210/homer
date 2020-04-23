const { Structures } = require('discord.js');
const moment = require('moment-timezone');

Structures.extend('Message', (Message) => {
  class CustomMessage extends Message {
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
     * Homer's dot for embeds
     */
    get dot() {
      return this.emote('dot');
    }

    /**
     * Generates a sendable emote from a name
     * @param {string} name Emote name
     * @param {boolean} discret Whether display the actuel emote name
     * @returns {string} Sendable emote
     */
    emote(name, discret = false) {
      const value = this.client.constants.emotes[name];
      if (!value) return null;
      if (value.length < 15) return value;
      return `<${(['loading', 'dspblk'].includes(name)) ? 'a' : ''}:${discret ? 'e' : name}:${value}>`;
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
      return this.react(`e:${this.client.constants.emotes.success}`);
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
      const str = `${this.emote('loading')} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Calls TextChannel#send with a ℹ️ before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    info(content, options) {
      const str = `${this.emote('info')} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Calls TextChannel#send with a :success: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    success(content, options) {
      const str = `${this.emote('success')} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Calls TextChannel#send with a :warn: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    warn(content, options) {
      const str = `${this.emote('warn')} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Calls TextChannel#send with a :error: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    error(content, options) {
      const str = `${this.emote('error')} ${content}`;
      return this.channel.send(str, options);
    }

    /**
     * Calls Message#edit with a :loading: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editLoading(content, options) {
      const str = `${this.emote('loading')} ${content}`;
      return this.edit(str, options);
    }

    /**
     * Calls Message#edit with a ℹ️ before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editInfo(content, options) {
      const str = `${this.emote('info')} ${content}`;
      return this.edit(str, options);
    }

    /**
     * Calls Message#edit with a :success: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editSuccess(content, options) {
      const str = `${this.emote('success')} ${content}`;
      return this.edit(str, options);
    }

    /**
     * Calls Message#edit with a :warn: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editWarn(content, options) {
      const str = `${this.emote('warn')} ${content}`;
      return this.edit(str, options);
    }

    /**
     * Calls Message#edit with a :error: before content
     * @param {string} content The content to send
     * @param {?object} options The options to provide
     * @returns {Promise<Message>}
     */
    editError(content, options) {
      const str = `${this.emote('error')} ${content}`;
      return this.edit(str, options);
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
      const emotes = [this.client.constants.emotes.success, this.client.constants.emotes.error];
      await this.react(`e:${emotes[0]}`).catch(() => null);
      await this.react(`e:${emotes[1]}`).catch(() => null);
      return this.awaitReactions(
        (reaction, user) => emotes.includes(reaction.emoji.id)
          && user.id === id,
        { max: 1 },
      )
        .then((reactions) => {
          if (this.guild && this.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
            this.reactions.removeAll();
          }
          const r = reactions.first();
          if (r.emoji.id === emotes[0]) {
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
