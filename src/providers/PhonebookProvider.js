const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'INT', 'PRIMARY KEY'],
  ['visible', 'bool', 'NOT NULL'],
  ['message', 'VARCHAR(100)', null],
  ['updated', 'TIMESTAMP', null],
  ['created', 'TIMESTAMP', 'NOT NULL'],
];

class PhonebookProvider extends Provider {
  constructor(client) {
    super(client, 'phonebook', TABLE_COLUMNS);

    /**
     * Maximum length for a phonebook message
     * @type {number}
     */
    this.maxLength = 100;
  }

  /**
   * Contract manager for the telephone
   * @type {ContractManager}
   */
  get contracts() {
    return this.client.telephone.contracts;
  }

  /**
   * Fetches displayable phonebook entries
   * @returns {Promise<Entry[]>} Phonebook
   */
  async fetchDisplayable() {
    return this.getRows([
      ['visible', '=', 'true'],
    ]);
  }

  /**
   * Creates an entry in the phonebook
   * @param {number} id Contract ID
   * @returns {Promise<number>} Entry ID
   */
  async createBook(id) {
    const contract = await this.contracts.getRow(id);
    if (!contract) throw new Error('UNKNOWN_CONTRACT');

    const existing = await this.getRow(id);
    if (existing) throw new Error('ALREADY_EXISTS');

    const entry = await this.insertRow({
      id,
      visible: false,
      created: new Date(),
    });

    return this.getRow(entry);
  }

  /**
   * Toggles phonebook display
   * @param {number} contract Contract ID
   * @returns {Promise<boolean>} New value
   */
  async toggleDisplay(id) {
    const entry = await this.getRow(id);
    if (!entry) throw new Error('UNKNOWN_ENTRY');

    if (!entry.message) throw new Error('NO_MESSAGE');

    if (entry.visible) entry.visible = false;
    else entry.visible = true;

    await this.updateRow(id, {
      visible: entry.visible,
      updated: new Date(),
    });

    return entry.visible;
  }

  /**
   * Sets the phonebook message and makes it visible
   * @param {number} id Contract ID
   * @param {string} message Phonebook message
   * @returns {Promise<void>}
   */
  async setMessage(id, message) {
    if (typeof message !== 'string') throw new Error('INVALID_MESSAGE');
    if (message.length > this.maxLength) throw new Error('MESSAGE_TOO_LONG');

    const entry = await this.getRow(id);
    if (!entry) throw new Error('UNKNOWN_ENTRY');

    await this.updateRow(id, {
      message,
      visible: true,
      updated: new Date(),
    });

    return null;
  }
}

module.exports = PhonebookProvider;
