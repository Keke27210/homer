const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'SERIAL', 'PRIMARY KEY'],
  ['name', 'VARCHAR(10)', 'NOT NULL'],
  ['key', 'VARCHAR(100)', 'NOT NULL'],
];

class APIProvider extends Provider {
  constructor(client) {
    super(client, 'api', TABLE_COLUMNS);
  }

  /**
   * Fetches an API key
   * @param {string} name Key's name
   * @returns {Promise<?string>}
   */
  async fetchKey(name) {
    if (!name) throw new Error('NO_NAME');
    const rows = await this.getRows([
      ['name', '=', name],
    ]);
    if (!rows.length) return null;
    return rows[0];
  }
}

module.exports = APIProvider;
