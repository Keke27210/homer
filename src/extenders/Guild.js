const { Structures } = require('discord.js');

Structures.extend('Guild', (Guild) => {
  class CustomGuild extends Guild {
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
