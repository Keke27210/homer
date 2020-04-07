const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'VARCHAR(20)', 'PRIMARY KEY UNIQUE'],
  ['activity', 'TIMESTAMP', null],
  ['names', 'TEXT', null],
];

class TrackingProvider extends Provider {
  constructor(client) {
    super(client, 'tracking', TABLE_COLUMNS, true);
  }

  /**
   * Fetches a user's activity
   * @param {string} id User ID
   * @returns {Promise<Date>}
   */
  async getActivity(id) {
    const entry = await this.getRow(id);
    if (!entry) return null;
    return entry.activity;
  }

  /**
   * Fetches names of a user
   * @param {string} id User ID
   * @returns {Promise<NameChange[]>}
   */
  async getNames(id) {
    const entry = await this.getRow(id);
    if (!entry) return [];
    return JSON.parse(entry.names);
  }

  /**
   * Updates the activity of a user
   * @param {string} id User ID
   * @returns {Promise<void>}
   */
  async updateActivity(id) {
    const entry = await this.getRow(id);
    if (!entry) await this.insertRow({ id });
    await this.updateRow(id, { activity: new Date() });
    return null;
  }

  /**
   * Adds a name change for a user
   * @param {string} id User ID
   * @param {string} name Username
   * @returns {Promise<void>}
   */
  async updateNames(id, name) {
    const entry = await this.getRow(id);
    if (!entry) await this.insertRow({ id });
    const names = entry ? JSON.stringify(entry.names) : [];
    names.push({ name, time: Date.now() });
    this.updateRow(id, { names });
    await this.updateActivity(id);
    return null;
  }
}

module.exports = TrackingProvider;
