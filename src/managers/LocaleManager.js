const { isAbsolute, resolve } = require('path');
const readdir = require('util').promisify(require('fs').readdir);
const Manager = require('../structures/Manager');

const MUSTACHE_SYNTAX = /\{\{\{\s*([\w\.]+)\s*\}\}\}/g;

class LocaleManager extends Manager {
  constructor(client) {
    super(client);

    this.options = this.client.config.localization;
    this.locales = {};
    this.directory = isAbsolute(this.options.directory) ? this.options.directory : resolve(__dirname, this.options.directory);
    this.defaultLocale = this.options.defaultLocale || 'en-gb';

    // Load locales
    this.loadLocales();
  }

  async loadLocales(sandbox = false) {
    const files = await readdir(this.directory);
    for (const file of files) {
      const localeFile = require(`${this.directory}/${file}`);
      if (!sandbox) this.locales[localeFile['lang.code']] = localeFile;
      this.client.clearCache(`${this.directory}/${file}`);
    }
  }

  async reloadLocales(sandbox = false) {
    if (!sandbox) this.locales = {};
    await this.loadLocales(sandbox);
  }

  isLocale(locale) {
    return Object.keys(this.locales).includes(locale);
  }

  hasKey(locale, key) {
    return !!((this.locales[locale][key] || this.locales[this.defaultLocale][key]));
  }

  translate(locale, key, args = {}) {
    if (!this.locales[locale]) locale = this.defaultLocale;

    let processKey = this.locales[locale][key] || this.locales[this.defaultLocale][key];
    if (!processKey) return key;

    const templates = processKey.match(MUSTACHE_SYNTAX) || [];
    for (const template of templates) {
      const destructured = MUSTACHE_SYNTAX.exec(template);
      processKey = processKey.replace(template, String(args[destructured[1]]) || '?');
      MUSTACHE_SYNTAX.lastIndex = 0;
    }

    return processKey;
  }
}

module.exports = LocaleManager;
