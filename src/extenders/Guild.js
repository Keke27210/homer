/* eslint-disable no-underscore-dangle */
const { Structures } = require('discord.js');

Structures.extend('Guild', (Guild) => {
  class CustomGuild extends Guild {
    _patch(data) {
      super._patch(data);

      if (typeof data.approximate_member_count !== 'undefined') {
        /**
         * Approximate member count for this guild
         * @type {number}
         */
        this.approximateMemberCount = data.approximate_member_count;
      }

      if (typeof data.approximate_presence_count !== 'undefined') {
        /**
         * Approximate presence count for this guild
         * @type {number}
         */
        this.approximatePresenceCount = data.approximate_presence_count;
      }
    }

    /**
     * Cached settings
     * @type {?Settings}
     */
    get settings() {
      return this.client.settings.cache.find((c) => c.id === this.id);
    }

    /**
     * Fetches settings
     * @returns {Promise<Settings>}
     */
    fetchSettings() {
      return this.client.settings.fetchSettings(this.id);
    }
  }

  return CustomGuild;
});
