class Provider {
  constructor(client, table, columns) {
    /**
     * Client that instantied this provider
     * @type {DiscordClient}
     */
    this.client = client;

    /**
     * Database table
     * @type {string}
     */
    this.table = table;

    /**
     * Table columns
     * @type {string[][]}
     */
    this.columns = columns;

    /**
     * Cache for this provider
     * @type {object[]}
     */
    this.cache = [];
  }

  /**
   * Client's database
   * @type {Database}
   */
  get database() {
    return this.client.database;
  }

  /**
   * Creates a table with the provided columns
   */
  async createTable() {
    const columns = this.columns
      .map((c) => `${c[0]} ${c[1]}${c[2] ? ` ${c[2]}` : ''}`)
      .join(', ');
    await this.database.query(`CREATE TABLE IF NOT EXISTS ${this.table} (${columns})`);
  }

  /**
   * Inserts a row in the table
   * @param {object} data Row data
   * @returns {Promise<number>} Row ID
   */
  async insertRow(data) {
    if (!this.database.ready) {
      throw new Error('UNAVAILABLE_DATABASE');
    }

    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);

    const query = await this.database.query(
      `INSERT INTO ${this.table} (${columns}) VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      Object.values(data),
    );

    const cache = this.cache.findIndex((c) => c.id === query.rows[0].id);
    if (cache >= 0) this.cache.splice(cache, 1);

    this.cache.push(query.rows[0]);
    return query.rows[0].id;
  }

  /**
   * Updates a row in the table
   * @param {number} id Row ID
   * @param {object} data Updated data
   * @returns {Promise<number>} Row ID
   */
  async updateRow(id, data) {
    if (!this.database.ready) {
      throw new Error('UNAVAILABLE_DATABASE');
    }

    const entries = Object.entries(data);

    const query = await this.database.query(
      `UPDATE ${this.table} SET ${entries.map(([k], i) => `${k} = $${i + 2}`).join(', ')} WHERE id = $1 RETURNING id`,
      [id].concat(Object.values(data)),
    );

    const index = this.cache.findIndex((c) => c.id === id);
    if (index >= 0) {
      for (let i = 0; i < entries.length; i += 1) {
        const [k, v] = entries;
        this.cache[index][k] = v;
      }
    }

    return query.rows[0].id;
  }

  /**
   * Deletes a row from the table
   * @param {number} id Row ID
   * @returns {Promise<number>} Number of rows deleted
   */
  async deleteRow(id) {
    if (!this.database.ready) {
      throw new Error('UNAVAILABLE_DATABASE');
    }

    const query = await this.database.query(`DELETE FROM ${this.table} WHERE id = $1`, [id]);

    const index = this.cache.findIndex((c) => c.id === id);
    if (index >= 0) this.cache.splice(index, 1);

    return query.rowCount;
  }

  /**
   * Gets a row from the table using its ID
   * @param {number} id Row ID
   * @param {boolean} fetch Ignore cache
   * @returns {Promise<Object>} Row
   */
  async getRow(id) {
    if (!this.database.ready) {
      throw new Error('UNAVAILABLE_DATABASE');
    }

    const cached = this.cache.find((c) => c.id === id);
    if (cached) return cached;

    const query = await this.database.query(`SELECT * FROM ${this.table} WHERE id = $1`, [id]);
    return query.rows[0] || null;
  }

  /**
   * Gets rows from the table using properties
   * @param {?object} properties Row properties
   * @returns {Promise<object[]>} Rows
   */
  async getRows(properties) {
    if (!this.database.ready) {
      throw new Error('UNAVAILABLE_DATABASE');
    }

    const conditions = [];
    if (properties) {
      for (let i = 0; i < properties.length; i += 1) {
        const prop = properties[i];
        if (Array.isArray(prop[0])) {
          conditions.push(`(${prop.map((p) => `${p[0]} ${p[1]} '${p[2]}'`).join(' OR ')})`);
        } else {
          conditions.push(`${prop[0]} ${prop[1]} '${prop[2]}'`);
        }
      }
    }

    const query = await this.database.query(`SELECT * FROM ${this.table} ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}`);
    return query.rows;
  }
}

module.exports = Provider;
