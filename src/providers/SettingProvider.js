const { tz } = require('moment-timezone');

const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'VARCHAR(20)', 'PRIMARY KEY UNIQUE'],
  ['locale', 'VARCHAR(5)', 'NOT NULL'],
  ['timezone', 'VARCHAR(32)', 'NOT NULL'],
  ['prefix', 'VARCHAR(5)', null],
  ['radio', 'VARCHAR(20)', null],
  ['volume', 'INT', null],
  ['time', 'VARCHAR(20)', null],
  ['date', 'VARCHAR(20)', null],
  ['updated', 'TIMESTAMP', null],
  ['created', 'TIMESTAMP', 'NOT NULL'],
];

class SettingProvider extends Provider {
  constructor(client) {
    super(client, 'settings', TABLE_COLUMNS);

    /**
     * Max length for a prefix
     * @type {number}
     */
    this.maxPrefixLength = 5;

    /**
     * Max length for a timezone
     * @type {number}
     */
    this.maxTimezoneLength = 32;
  }

  /**
   * Generates a settings object
   * @param {number} id Context ID
   * @returns {Settings} Settings
   */
  generateSettings(id) {
    return ({
      id,
      locale: this.client.localeManager.defaultLocale,
      timezone: 'UTC',
      volume: 50,
      time: 'HH:mm:ss',
      date: 'DD/MM/YYYY',
      created: new Date(),
    });
  }

  /**
   * Creates settings
   * @param {number} id Context ID
   * @returns {Promise<Settings>} Settings
   */
  async createSettings(id) {
    const settings = await this.getRow(id);
    if (settings) throw new Error('SETTINGS_EXISTS');

    await this.insertRow(this.generateSettings(id));

    return this.getRow(id);
  }

  /**
   * Fetches settings
   * @param {number} id Context ID
   * @returns {Promise<Settings>} settings
   */
  async fetchSettings(id) {
    let settings;
    if (this.database.ready) {
      settings = await this.getRow(id);
    }
    if (!settings) {
      settings = this.generateSettings(id);
      this.cache.push(settings);
    }
    return settings;
  }

  /**
   * Sets a locale
   * @param {number} id Context ID
   * @param {string} locale Locale code
   * @returns {Promise<void>}
   */
  async setLocale(id, locale) {
    if (!this.client.localeManager.isValid(locale)) throw new Error('INVALID_LOCALE');

    const existing = await this.getRow(id);
    if (!existing) await this.createSettings(id);

    await this.updateRow(id, {
      locale,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets a timezone
   * @param {number} id Context ID
   * @param {string} timezone Timezone identifier
   * @returns {Promise<void>}
   */
  async setTimezone(id, timezone) {
    if (timezone.length > this.maxTimezoneLength) throw new Error('INVALID_LENGTH');
    if (!tz.names().includes(timezone)) throw new Error('INVALID_LOCALE');

    const existing = await this.getRow(id);
    if (!existing) await this.createSettings(id);

    await this.updateRow(id, {
      timezone,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets a prefix
   * @param {number} id Context ID
   * @param {string} prefix Prefix
   * @returns {Promise<void>}
   */
  async setPrefix(id, prefix) {
    if (prefix.length > this.maxPrefixLength) throw new Error('INVALID_LENGTH');
    if (this.client.commandManager.prefixes.includes(prefix)) throw new Error('DEFAULT_PREFIX');

    const existing = await this.getRow(id);
    if (!existing) await this.createSettings(id);

    await this.updateRow(id, {
      prefix,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets radio channel
   * @param {number} id Context ID
   * @param {string} channel Channel ID
   * @returns {Promise<void>}
   */
  async setRadio(id, channel) {
    const ch = this.client.channels.resolve(channel);
    if (!ch || ch.type !== 'voice') throw new Error('INVALID_CHANNEL');

    const existing = await this.getRow(id);
    if (!existing) await this.createSettings(id);

    await this.updateRow(id, {
      radio: channel,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets radio volume
   * @param {number} id Context ID
   * @param {number} volume Volume
   * @returns {Promise<void>}
   */
  async setVolume(id, volume) {
    if (volume < 0 || volume > 100) throw new Error('INVALID_VOLUME');

    const existing = await this.getRow(id);
    if (!existing) await this.createSettings(id);

    await this.updateRow(id, {
      volume,
      updated: new Date(),
    });

    return null;
  }
}

module.exports = SettingProvider;
