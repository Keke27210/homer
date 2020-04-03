const { Structures } = require('discord.js');

Structures.extend('Guild', (Guild) => {
  class CustomGuild extends Guild {
    constructor(client, data) {
      super(client, data);

      /**
       * Settings for this guild
       * @type {?GuildSettings}
       */
      this.settings = null;
    }

    /**
     * Fetches settings from the database
     * @returns {Promise<boolean>} Were the settings fetched correctly
     */
    fetchSettings() {
      if (this.settings) return this.settings;
      if (!this.client.database.ready) {
        this.settings = this.generateSettings();
        return this.settings;
      }

      return this.client.database.query(`SELECT * FROM settings WHERE id = '${this.id}'`)
        .then((res) => {
          let settings = res[0];
          if (!settings) settings = this.generateSettings();
          this.settings = {
            id: this.id,
            locale: res[1],
            timezone: res[2],
            creation: res[3],
            edit: res[4],
          };
          return settings;
        })
        .catch((error) => {
          this.client.logger.error(`[guild ${this.id}] Error while fetching guild settings`, error);
          return false;
        });
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

/**
 * @typedef GuildSettings
 * @property {string} id Guild ID
 * @property {string} language Display language
 * @property {string} timezone Display timezone
 * @property {?number} creation Creation timestamp (null if default)
 * @property {?number} edit Last edit timestamp (null if never edited)
 */
