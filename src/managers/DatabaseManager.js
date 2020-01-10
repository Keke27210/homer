const rethinkdb = require('rethinkdbdash');
const Manager = require('../structures/Manager');

const noCache = ['lastactive', 'names'];

class DatabaseManager extends Manager {
  constructor(client) {
    super(client);
    this.provider = rethinkdb(this.client.config.database);

    // Preparing tables cache
    this.cache = {};
    this.provider.tableList()
      .then((tables) => {
        tables.forEach((table) => {
          this.cache[table] = [];
        });
      })
      .catch(() => this.client.logger.error('Unable to prepare tables cache (database tableList error)'));
  }

  async findDocuments(table, predicate, fetch = false) {
    if (!fetch && !noCache.includes(table)) {
      const found = [];
      const properties = Object.entries(predicate);

      for (let i = 0; i < this.cache[table].length; i += 1) {
        const item = this.cache[table][i];

        if (item) {
          let valid = true;
          properties.forEach(([k, v]) => {
            if (item[k] !== v) valid = false;
          });
          if (valid) found.push(item);
        }
      }

      if (found.length > 0) return found;
    }

    const data = await this.provider
      .table(table)
      .filter(predicate)
      .run();

    data.forEach((d) => this.cache[table].push(d));
    return data;
  }

  async getDocument(table, key, fetch = false) {
    const cache = this.cache[table].find((item) => (item ? item.id === key : false));
    if (!fetch && !noCache.includes(table) && cache) return cache;

    const data = await this.provider
      .table(table)
      .get(key)
      .run();

    if (data) {
      if (!this.cache[table].find((a) => a.id === data.id)) this.cache[table].push(data);
      else {
        this.cache[table].splice(this.cache[table].findIndex((a) => a.id === data.id), 1);
        this.cache[table].push(data);
      }
    }

    return data;
  }

  async getDocuments(table, fetch = false) {
    if (!fetch && !noCache.includes(table)
      && Object.keys(this.cache[table]).length > 0) return this.cache[table];

    const data = await this.provider
      .table(table)
      .run();

    data.forEach((d) => {
      if (!this.cache[table].find((a) => a.id === d.id)) this.cache[table].push(d);
    });
    return data;
  }

  async insertDocument(table, data, options) {
    // Data with no "ID" property are not cacheable
    if (data.id) {
      if (!noCache.includes(table)) {
        const index = this.cache[table].findIndex((item) => (item ? item.id === data.id : false));
        if (index !== -1) {
          Object
            .entries(data)
            .forEach(([k, v]) => {
              this.cache[table][index][k] = v;
            });
        } else {
          this.cache[table].push(data);
        }
      }
    }

    return this.provider
      .table(table)
      .insert(data, options)
      .run();
  }

  async updateDocument(table, key, data) {
    if (!noCache.includes(table)) {
      let index = this.cache[table].findIndex((item) => (item ? item.id === key : false));
      if (!index) {
        await this.getDocument(table, key, true);
        index = this.cache[table].findIndex((item) => (item ? item.id === key : false));
      }

      // C'est vraiment de la mauvaise foi si on en arrive là, on force quand même
      if (index) {
        Object
          .entries(data)
          .forEach(([k, v]) => {
            try {
              this.cache[table][index][k] = v;
            } catch (e) {
              this.client.logger.warn('[Database] Weird behaviour suspected!');
            }
          });
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
        this.cache[table].findIndex((item) => (item ? item.id === key : false)),
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
