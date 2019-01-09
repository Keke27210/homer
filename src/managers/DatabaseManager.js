const rethinkdb = require('rethinkdbdash');
const Manager = require('../structures/Manager');

const tables = [
  'afk',
  'archives',
  'blacklist',
  'bot',
  'calls',
  'commandStats',
  'cooldown',
  'donators',
  'jobs',
  'lastactive',
  'names',
  'profiles',
  'radios',
  'radioFeatured',
  'radioStats',
  'reports',
  'rss',
  'settings',
  'tags',
  'telephone',
  'vip',
];

const noCache = ['lastactive', 'names'];

class DatabaseManager extends Manager {
  constructor(client) {
    super(client);
    this.provider = rethinkdb(this.client.config.database);
    this.cache = {};
    for (const table of tables) this.cache[table] = [];
  }

  async findDocuments(table, predicate, fetch = false) {
    if (!fetch && !noCache.includes(table)) {
      const found = [];
      const properties = Object.entries(predicate);

      for (let i = 0; i < this.cache[table].length; i += 1) {
        const item = this.cache[table][i];
        if (!item) continue;

        let valid = true;
        for (const [k, v] of properties) {
          if (item[k] !== v) valid = false;
        }
        if (valid) found.push(item);
      }

      if (found.length > 0) return found;
    }

    const data = await this.provider
      .table(table)
      .filter(predicate)
      .run();

    for (const d of data) this.cache[table].push(d);
    return data;
  }

  async getDocument(table, key, fetch = false) {
    const cache = this.cache[table].find(item => item ? item.id === key : false);
    if (!fetch && !noCache.includes(table) && cache) return cache;

    const data = await this.provider
      .table(table)
      .get(key)
      .run();

    if (data) {
      if (!this.cache[table].find(a => a.id === data.id)) this.cache[table].push(data);
      else {
        this.cache[table].splice(this.cache[table].findIndex(a => a.id === data.id), 1);
        this.cache[table].push(data);
      }
    }

    return data;
  }

  async getDocuments(table, fetch = false) {
    if (!fetch && !noCache.includes(table) && Object.keys(this.cache[table]).length > 0) return this.cache[table];

    const data = await this.provider
      .table(table)
      .run();

    for (const d of data) if (!this.cache[table].find(a => a.id === d.id)) this.cache[table].push(d);
    return data;
  }

  insertDocument(table, data, options) {
    if (!noCache.includes(table)) {
      const index = this.cache[table].findIndex(item => item ? item.id === data.id : false);
      if (index !== -1) {
        for (const [k, v] of Object.entries(data)) {
          this.cache[table][index][k] = v;
        }
      } else {
        this.cache[table].push(data);
      }
    }

    return this.provider
      .table(table)
      .insert(data, options)
      .run();
  }

  updateDocument(table, key, data) {
    if (!noCache.includes(table)) {
      const index = this.cache[table].findIndex(item => item ? item.id === key : false);
      for (const [k, v] of Object.entries(data)) {
        this.cache[table][index][k] = v;
      }
    }

    return this.provider
      .table(table)
      .get(key)
      .update(data)
      .run();
  }

  deleteDocument(table, key) {
    if (!noCache.includes(table)) {
      this.cache[table].splice(
        this.cache[table].findIndex(item => item ? item.id === key : false),
        1,
      );
    }

    return this.provider
      .table(table)
      .get(key)
      .delete()
      .run();
  }
}

module.exports = DatabaseManager;
