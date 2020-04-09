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
}

module.exports = RadioProvider;
