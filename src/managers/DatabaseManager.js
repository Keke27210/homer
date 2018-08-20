const rethinkdb = require('rethinkdbdash');
const Manager = require('../structures/Manager');

class DatabaseManager extends Manager {
  constructor(client) {
    super(client);
    this.provider = rethinkdb(this.client.config.database);
    this.cache = {};
    this.prepareCache();
  }

  async prepareCache() {
    const tables = await this.provider.tableList();
    for (const table of tables) this.cache[table] = [];
  }

  async findDocuments(table, predicate) {
    const found = [];
    const properties = Object.entries(predicate);

    for (let i = 0; i < this.cache[table].length; i += 1) {
      const item = this.cache[table][i];
      let valid = true;
      for (const [k, v] of properties) {
        if (item[k] !== v) valid = false;
      }
      if (valid) found.push(item);
    }

    if (found.length > 0) return found;

    return this.provider
      .table(table)
      .filter(predicate)
      .run();
  }

  async getDocument(table, key) {
    const cache = this.cache[table].find(item => item.id === key);
    if (cache) return cache;

    const data = await this.provider
      .table(table)
      .get(key)
      .run();

    this.cache[table].push(data);
    return data;
  }

  async getDocuments(table) {
    if (Object.keys(this.cache[table]).length > 0) return this.cache[table];

    const data = await this.provider
      .table(table)
      .run();

    this.cache[table] = data;
    return data;
  }

  insertDocument(table, data, options) {
    const index = this.cache[table].findIndex(item => item.id === key);
    if (index) {
      for (const [k, v] of Object.entries(data)) {
        this.cache[table][index][k] = v;
      }
    } else {
      this.cache[table].push(data);
    }

    return this.provider
      .table(table)
      .insert(data, options)
      .run();
  }

  updateDocument(table, key, data) {
    const index = this.cache[table].findIndex(item => item.id === key);
    for (const [k, v] of Object.entries(data)) {
      this.cache[table][index][k] = v;
    }

    return this.provider
      .table(table)
      .get(key)
      .update(data)
      .run();
  }

  deleteDocument(table, key) {
    this.cache[table].splice(
      this.cache[table].findIndex(item => item.id === key),
      1,
    );

    return this.provider
      .table(table)
      .get(key)
      .delete()
      .run();
  }
}

module.exports = DatabaseManager;
