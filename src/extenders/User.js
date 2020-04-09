/* eslint-disable no-underscore-dangle */
const { Structures } = require('discord.js');

const UserFlags = require('../structures/UserFlags');

Structures.extend('User', (User) => {
  class CustomUser extends User {
    _patch(data) {
      super._patch(data);

      /**
       * Flags for that user
       * @type {?UserFlags}
       */
      this.flags = typeof data.public_flags !== 'undefined'
        ? new UserFlags(data.public_flags)
        : null;
    }

    /**
     * Returns the user tag following Homer design
     * @type {string}
     */
    get tag() {
      return `**${this.username}**#${this.discriminator}`;
    }

    /**
     * Cached settings
     * @type {?Settings}
     */
    get settings() {
      return this.client.settings.cache.find((c) => c.id === this.id);
    }

    /**
     * Fetches user flags
     * @returns {Promise<UserFlags>}
     */
    async fetchFlags() {
      if (this.flags) return this.flags;
      return this.client.api
        .users(this.id)
        .get()
        .then((data) => {
          this._patch(data);
          this.flags.fetched = true;
          return this.flags;
        });
    }

    /**
     * Fetches settings from the database
     * @returns {Promise<Settings>}
     */
    fetchSettings() {
      return this.client.settings.fetchSettings(this.id);
    }
  }

  return CustomUser;
});
