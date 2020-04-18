const fetch = require('node-fetch');

const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'SERIAL', 'PRIMARY KEY'],
  ['frequency', 'VARCHAR(5)', 'UNIQUE NOT NULL'],
  ['name', 'VARCHAR(40)', 'NOT NULL'],
  ['stream', 'TEXT', 'NOT NULL'],
  ['pty', 'INT', null],
  ['emote', 'VARCHAR(20)', null],
  ['website', 'TEXT', null],
  ['language', 'VARCHAR(20)', null],
  ['country', 'VARCHAR(20)', null],
  ['radionet', 'INT', null],
  ['updated', 'TIMESTAMP', null],
  ['created', 'TIMESTAMP', 'NOT NULL'],
];

class RadioProvider extends Provider {
  constructor(client) {
    super(client, 'radios', TABLE_COLUMNS);
  }

  /**
   * Finds a radio using its frequency
   * @param {string} frequency Frequency
   * @returns {Promise<Radio>} Radio
   */
  async getRadio(frequency) {
    const radios = await this.getRows([
      ['frequency', '=', frequency],
    ]);
    return radios[0] || null;
  }

  /**
   * Fetches playing information from radio.net
   * @param {number} id Radio ID
   * @returns {Promise<string>}
   */
  async nowPlaying(id) {
    const api = this.client.apis.fetchKey('radionet');
    if (!api) return null;

    const radio = await this.getRow(id);
    if (!radio) throw new Error('UNKNOWN_RADIO');
    if (!radio.radionet) return null;

    const req = await fetch(`https://api.radio.net/info/v2/search/nowplaying?apikey=${api.key}&numberoftitles=1&station=${radio.radionet}`)
      .then((r) => r.json())
      .catch(() => null);
    if (!req) return null;

    return req[0].streamTitle;
  }
}

module.exports = RadioProvider;
