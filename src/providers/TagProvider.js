const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'SERIAL', 'PRIMARY KEY'],
  ['name', 'VARCHAR(30)', 'NOT NULL'],
  ['content', 'TEXT', 'NOT NULL'],
  ['author', 'VARCHAR(20)', 'NOT NULL'],
  ['active', 'bool', 'NOT NULL'],
  ['source', 'bool', 'NOT NULL'],
  ['updated', 'TIMESTAMP', null],
  ['created', 'TIMESTAMP', 'NOT NULL'],
];

class TagProvider extends Provider {
  constructor(client) {
    super(client, 'tags', TABLE_COLUMNS);

    /**
     * Maximum length for name
     * @type {number}
     */
    this.nameLength = 30;

    /**
     * Maximum length for content
     * @type {number}
     */
    this.maxLength = 2000;
  }

  /**
   * Creates a tag
   * @param {string} name Tag name
   * @param {string} content Tag content
   * @param {string} author Author ID
   * @returns {Promise<void>}
   */
  async createTag(name, content, author) {
    if (!name || !content || !author) throw new Error('MISSING_DATA');

    const existing = await this.getTag(name);
    if (existing) throw new Error('ALREADY_EXISTS');

    if (name.length > this.nameLength) throw new Error('NAME_LENGTH');
    if (content.length > this.maxLength) throw new Error('CONTENT_LENGTH');

    await this.insertRow({
      name: name.toLowerCase(),
      content,
      author,
      active: true,
      source: true,
      created: new Date(),
    });

    return null;
  }

  /**
   * Fetches a tag from its name
   * @param {string} name Tag name
   * @returns {Promise<Tag>}
   */
  async getTag(name) {
    const rows = await this.getRows([
      ['name', '=', name.toLowerCase()],
    ]);
    return rows[0] || null;
  }

  /**
   * Edits a tag with a new content
   * @param {number} id Tag ID
   * @param {string} content New tag's content
   * @returns {Promise<void>}
   */
  async editTag(id, content) {
    if (!id || !content) throw new Error('MISSING_DATA');
    if (content.length > this.maxLength) throw new Error('CONTENT_LENGTH');

    const existing = await this.getRow(id);
    if (!existing) throw new Error('UNKNOWN_TAG');

    await this.updateRow(id, {
      content,
      updated: new Date(),
    });

    return null;
  }

  /**
   * Deletes a tag from its ID
   * @param {number} id Tag ID
   * @returns {Promise<void>}
   */
  async deleteTag(id) {
    if (!id) throw new Error('MISSING_DATA');

    const existing = await this.getRow(id);
    if (!existing) throw new Error('UNKNOWN_TAG');

    await this.deleteRow(existing.id);

    return null;
  }

  /**
   * Activates or deactivates a tag
   * @param {number} id Tag ID
   * @returns {Promise<boolean>} New state
   */
  async activateTag(id) {
    if (!id) throw new Error('MISSING_DATA');

    const existing = await this.getRow(id);
    if (!existing) throw new Error('UNKNOWN_TAG');

    await this.updateRow(id, {
      active: !existing.active,
      updated: new Date(),
    });

    return !existing.active;
  }

  /**
   * Publishes or unpublishes a tag's source
   * @param {number} id Tag ID
   * @returns {Promise<boolean>} New state
   */
  async sourceTag(id) {
    if (!id) throw new Error('MISSING_DATA');

    const existing = await this.getRow(id);
    if (!existing) throw new Error('UNKNOWN_TAG');

    await this.updateRow(id, {
      source: !existing.source,
      updated: new Date(),
    });

    return !existing.source;
  }
}

module.exports = TagProvider;
