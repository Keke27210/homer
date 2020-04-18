const { tz } = require('moment-timezone');

const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'VARCHAR(20)', 'PRIMARY KEY UNIQUE'],
  ['locale', 'VARCHAR(5)', 'NOT NULL'],
  ['timezone', 'VARCHAR(32)', 'NOT NULL'],
  ['prefix', 'VARCHAR(5)', null],
  ['radio', 'VARCHAR(20)', null],
  ['volume', 'INT', null],
  ['boost', 'bool', null],
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

    /**
     * Max length for a date/time format
     * @type {number}
     */
    this.maxFormatLength = 20;
  }

  /**
   * Generates a settings object
   * @param {string} id Context ID
   * @param {?boolean} temp Temporary settings
   * @returns {Settings} Settings
   */
  generateSettings(id, temp = false) {
    const settings = {
      id,
      locale: this.client.localeManager.defaultLocale,
      timezone: 'UTC',
      volume: 50,
      time: 'HH:mm:ss',
      date: 'DD/MM/YYYY',
      created: new Date(),
    };

    if (temp) settings.temp = true;
    return settings;
  }

  /**
   * Creates settings
   * @param {string} id Context ID
   * @returns {Promise<Settings>} Settings
   */
  async createSettings(id) {
    const settings = await this.getRow(id);
    if (settings && !settings.temp) throw new Error('SETTINGS_EXISTS');

    await this.insertRow(this.generateSettings(id));

    return this.getRow(id);
  }

  /**
   * Fetches settings
   * @param {string} id Context ID
   * @returns {Promise<Settings>} settings
   */
  async fetchSettings(id) {
    let settings;
    if (this.database.ready) {
      settings = await this.getRow(id);
    }
    if (!settings) {
      settings = this.generateSettings(id, true);
      this.cache.push(settings);
    }
    return settings;
  }

  /**
   * Sets a locale
   * @param {string} id Context ID
   * @param {string} locale Locale code
   * @returns {Promise<void>}
   */
  async setLocale(id, locale) {
    if (!this.client.localeManager.isValid(locale)) throw new Error('INVALID_LOCALE');

    const existing = await this.getRow(id);
    if (!existing || existing.temp) await this.createSettings(id);

    await this.updateRow(id, {
      locale,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets a timezone
   * @param {string} id Context ID
   * @param {string} timezone Timezone identifier
   * @returns {Promise<void>}
   */
  async setTimezone(id, timezone) {
    if (timezone.length > this.maxTimezoneLength) throw new Error('INVALID_LENGTH');
    if (!tz.names().includes(timezone)) throw new Error('INVALID_LOCALE');

    const existing = await this.getRow(id);
    if (!existing || existing.temp) await this.createSettings(id);

    await this.updateRow(id, {
      timezone,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets a prefix
   * @param {string} id Context ID
   * @param {string} prefix Prefix
   * @returns {Promise<void>}
   */
  async setPrefix(id, prefix) {
    if (prefix) {
      if (prefix.length > this.maxPrefixLength) throw new Error('INVALID_LENGTH');
      if (this.client.commandManager.prefixes.includes(prefix)) throw new Error('DEFAULT_PREFIX');
    }

    const existing = await this.getRow(id);
    if (!existing || existing.temp) await this.createSettings(id);

    await this.updateRow(id, {
      prefix,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets radio channel
   * @param {string} id Context ID
   * @param {string} channel Channel ID
   * @returns {Promise<void>}
   */
  async setRadio(id, channel) {
    const ch = this.client.channels.resolve(channel);
    if (!ch || ch.type !== 'voice') throw new Error('INVALID_CHANNEL');

    const existing = await this.getRow(id);
    if (!existing || existing.temp) await this.createSettings(id);

    await this.updateRow(id, {
      radio: channel,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets radio volume
   * @param {string} id Context ID
   * @param {number} volume Volume
   * @returns {Promise<void>}
   */
  async setVolume(id, volume) {
    if (volume < 0 || volume > 100) throw new Error('INVALID_VOLUME');

    const existing = await this.getRow(id);
    if (!existing || existing.temp) await this.createSettings(id);

    await this.updateRow(id, {
      volume,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Sets date and time formats
   * @param {string} id Context ID
   * @param {string} date Date format
   * @param {string} time Time format
   * @returns {Promise<void>}
   */
  async setFormats(id, date, time) {
    if (date && date.length > this.maxFormatLength) throw new Error('DATE_LENGTH');
    if (time && time.length > this.maxFormatLength) throw new Error('TIME_LENGTH');

    const existing = await this.getRow(id);
    if (!existing || existing.temp) await this.createSettings(id);

    const update = {};
    if (date) update.date = date;
    if (time) update.time = time;
    await this.updateRow(id, update);

    return null;
  }

  /**
   * Returns if a user or guild has donator perks enabled
   * @param {string} id Context ID
   * @returns {Promise<boolean>}
   */
  async isDonator(id) {
    const existing = await this.getRow(id);
    if (!existing || !existing.boost) return false;
    return true;
  }
}

module.exports = SettingProvider;
