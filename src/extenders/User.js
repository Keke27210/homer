const { Structures } = require('discord.js');

Structures.extend('User', (User) => {
  class CustomUser extends User {
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
      return this.client.settingsUtil.cache.find((c) => c.id === this.id);
    }

    /**
     * Fetches settings from the database
     * @returns {Promise<Settings>}
     */
    fetchSettings() {
      return this.client.settingsUtil.fetchSettings(this.id);
    }
  }

  return CustomUser;
});
