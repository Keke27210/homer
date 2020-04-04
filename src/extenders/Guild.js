const { Structures } = require('discord.js');

Structures.extend('Guild', (Guild) => {
  class CustomGuild extends Guild {
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

    /**
     * Saves settings into the database
     * @returns {Promise<QueryResult>} Query result
     */
    saveSettings() {
      if (!this.client.database.ready) return;

      if (!this.settings.creation) {
        this.settings.creation = new Date().toISOString();
      } else {
        this.settings.edit = new Date().toISOString();
      }

      // eslint-disable-next-line consistent-return
      return this.client.database.query(
        this.settings.creation
          ? 'UPDATE settings SET(id, language, timezone, creation, edit) = ($1, $2, $3, $4, $5) WHERE id=\'$1\''
          : 'INSERT INTO settings(id, language, timezone, creation, edit) VALUES ($1, $2, $3, $4, $5)',
        [
          this.id,
          this.settings.language,
          this.settings.timezone,
          this.settings.creation,
          this.settings.edit,
        ],
      )
        .catch((error) => {
          this.client.logger.error(`[guild ${this.id}] Error while saving guild settings`, error);
        });
    }

    /**
     * Generates settings for this guild
     * @returns {GuildSettings}
     */
    generateSettings() {
      return ({
        id: this.id,
        locale: this.client.localeManager.defaultLocale,
        timezone: 'UTC',
        creation: null,
        edit: null,
      });
    }
  }

  return CustomGuild;
});
