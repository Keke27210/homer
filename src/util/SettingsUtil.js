const Util = require('./Util');

class SettingsUtil extends Util {
  constructor(client) {
    super(client);

    /**
     * Settings cache
     * @type {object[]}
     */
    this.cache = [];
  }

  /**
   * Returns cache settings or fetches them from the database
   * @param {string} id Discord ID
   * @returns {Promise<Settings>} Settings
   */
  fetchSettings(id) {
    const cached = this.cache.find((c) => c.id === id);
    if (cached) return cached;
    if (!this.client.database.ready) return this.generateSettings(id);
    return this.client.database.query('SELECT * FROM settings WHERE id=\'$1\'', id)
      .then((res) => this.generateSettings(id, res[0]));
  }

  /**
   * Generates a settings object for a guild or a user
   * @param {string} id Discord ID
   * @param {?object} data Data from database
   */
  generateSettings(id, data) {
    this.client.logger.log(`[settings] Generated settings for Discord ID ${id}`);
    const settings = ({
      id,
      locale: data ? data[1] : this.client.localeManager.defaultLocale,
      timezone: data ? data[2] : 'UTC',
      ignored: data ? JSON.parse(data[3]) : [],
      radio: {
        channel: data ? data[4] : null,
        volume: data ? (data[5] / 100) : 0.5,
      },
      formats: {
        date: data ? data[6] : 'DD/MM/YYYY',
        time: data ? data[7] : 'HH:mm:ss',
      },
    });

    const cached = this.cache.find((c) => c.id === id);
    if (cached) this.cache.splice(this.cache.indexOf(cached), 1);
    this.cache.push(settings);
    return settings;
  }
}

module.exports = SettingsUtil;
