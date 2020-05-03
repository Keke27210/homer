const { readdirSync } = require('fs');
const { resolve } = require('path');

const Manager = require('./Manager');

class LocaleManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Base directory for locales
     * @type {string}
     */
    this.localeDirectory = resolve(this.srcDirectory, 'locales');

    /**
     * Registered locales
     * @type {Locale[]}
     */
    this.locales = [];

    /**
     * Fallback locale used if the specified one doesn't exist
     * @type {string}
     */
    this.defaultLocale = 'en-gb';
  }

  /**
   * Registers all available locales into the client
   * @returns {number} Number of registered locales
   */
  registerLocales() {
    let i = 0;
    const dirContent = readdirSync(this.localeDirectory);
    while (i < dirContent.length) {
      const locale = require(resolve(this.localeDirectory, dirContent[i]))('▫️');
      this.locales[locale._.code] = locale;
      i += 1;
    }
    return i;
  }

  /**
   * Unregisters locales loaded in memory
   */
  unregisterLocales() {
    while (this.locales.length) this.locales.pop();
  }

  /**
   * Calls unregisterLocales() then registerLocales()
   * @returns {number} Number of registered locales
   */
  reloadLocales() {
    this.unregisterLocales();
    return this.registerLocales();
  }

  /**
   * Returns true if this locale is supported
   * @param {string} locale Locale code
   * @returns {boolean}
   */
  isValid(locale) {
    return Boolean(this.locales[locale]);
  }

  /**
   * Processes a key with the given arguments
   * @param {string} locale Locale to use
   * @param {string} key Translation key
   * @param {...any} args Arguments to pass
   * @returns {string} Translated value (or error message)
   */
  translate(locale, key, ...args) {
    if (!this.locales[locale]) return 'UNKNOWN_LOCALE';
    const tree = key.split('.');
    let fn = this.locales[locale];
    for (let i = 0; i < tree.length; i += 1) {
      try {
        fn = fn[tree[i]];
      } catch (e) {
        break;
      }
    }
    if (typeof fn === 'function') {
      return fn(...args);
    } if (typeof fn === 'string' || Array.isArray(fn)) {
      return fn;
    } if (fn === null) {
      return null;
    }
    this.client.logger.warn(`[locale] No value for key '${key}' in locale '${locale}'`);
    return 'UNKNOWN_KEY';
  }
}

module.exports = LocaleManager;
