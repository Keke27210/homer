const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'VARCHAR(20)', 'PRIMARY KEY'],
  ['activity', 'TIMESTAMP', null],
  ['names', 'TEXT[][2]', null],
];

class TrackingProvider extends Provider {
  constructor(client) {
    super(client, 'tracking', TABLE_COLUMNS, false);

    /**
     * Delay after which is considered as "deletable"
     * a tracking entry with no names recorded
     * Current: 6 months
     * @type {number}
     */
    this.deletableDelay = (6 * 30 * 24 * 60 * 60 * 1000);

    /**
     * Sweep interval
     * Current: 24 hours
     * @type {number}
     */
    this.sweepInterval = (24 * 60 * 60 * 1000);

    this.client.setInterval(() => this.deleteEntries(), this.sweepInterval);
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
    if (!entry || !entry.names) return [];
    const { names } = entry;
    for (let i = 0; i < names.length; i += 1) {
      names[i] = JSON.parse(names[i]);
    }
    return names;
  }

  /**
   * Updates the activity of a user
   * @param {string} id User ID
   * @returns {Promise<void>}
   */
  async updateActivity(id) {
    if (!this.database.ready) throw new Error('UNAVAILABLE_DATABASE');
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
    if (!this.database.ready) throw new Error('UNAVAILABLE_DATABASE');
    const entry = await this.getRow(id);
    if (!entry) await this.insertRow({ id });
    const names = entry && entry.names ? entry.names : [];
    names.push({ name, time: Date.now() });
    await this.updateRow(id, { activity: new Date(), names });
    return null;
  }

  /**
   * Deletes entries that do not have names recorded
   * with activity older than 6 months
   * @param {string} id User ID
   * @returns {Promise<void>}
   */
  async deleteEntries() {
    this.client.logger.log('[tracking] Clearing outdated entries');
    const entries = await this.getRows([
      ['names', 'is', 'null'],
      ['activity', '<', new Date(Date.now() - this.deletableDelay).toISOString(), 'timestamp'],
    ]);
    if (!entries.length) return;
    for (let i = 0; i < entries.length; i += 1) {
      await this.deleteRow(entries[i].id);
    }
  }
}

module.exports = TrackingProvider;
