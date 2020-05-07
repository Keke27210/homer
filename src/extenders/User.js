const { Structures } = require('discord.js');
const moment = require('moment-timezone');

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
      return this.client.settings.cache.find((c) => c.id === this.id);
    }

    /**
     * Boosting level of this user based on Homer guilds
     * @type {number}
     */
    get boostingLevel() {
      let time;
      this.client.guilds.cache.forEach((guild) => {
        const member = guild.member(this.id);
        if (member && member.premiumSinceTimestamp) {
          if (member.premiumSinceTimestamp < time) time = member.premiumSinceTimestamp;
        }
      });
      if (!time) return 0;

      const delta = moment().diff(moment(time), 'months', true);
      if (delta < 2) return 1;
      if (delta >= 2 && delta < 3) return 2;
      if (delta >= 3 && delta < 6) return 3;
      if (delta >= 6 && delta < 9) return 4;
      if (delta >= 9 && delta < 12) return 5;
      if (delta >= 12 && delta < 15) return 6;
      if (delta >= 15 && delta < 18) return 7;
      if (delta >= 18 && delta < 24) return 8;
      return 9;
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
