const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'VARCHAR(20)', 'PRIMARY KEY'],
  ['activity', 'TIMESTAMP', null],
  ['names', 'TEXT[][2]', null],
];

class TrackingProvider extends Provider {
  constructor(client) {
    super(client, 'tracking', TABLE_COLUMNS, false);
  }

  /**
   * Creates a tracking entry
   * @param {string} id User ID
   * @returns {Promise<Track>}
   */
  async createTracking(id) {
    return ({ id, activity: null, names: [] });
  }

  /**
   * Fetches a user's activity
   * @param {string} id User ID
   * @returns {Promise<Date>}
   */
  async getActivity(id) {
    return null;
  }

  /**
   * Fetches names of a user
   * @param {string} id User ID
   * @returns {Promise<NameChange[]>}
   */
  async getNames(id) {
    return [];
  }

  /**
   * Updates the activity of a user
   * @param {string} id User ID
   * @returns {Promise<void>}
   */
  async updateActivity(id) {
    return null;
  }

  /**
   * Adds a name change for a user
   * @param {string} id User ID
   * @param {string} name Username
   * @returns {Promise<void>}
   */
  async updateNames(id, name) {
    return null;
  }

  /**
   * Deletes entries that do not have names recorded
   * with activity older than 6 months
   * @param {string} id User ID
   * @returns {Promise<void>}
   */
  async deleteEntries() {
  }
}

module.exports = TrackingProvider;
