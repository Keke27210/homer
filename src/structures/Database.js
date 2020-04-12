const { Client } = require('pg');

class Database extends Client {
  constructor(databaseCredentials) {
    if (typeof databaseCredentials !== 'object') {
      throw new Error('[database] databaseCredentials must be an object');
    }

    super(databaseCredentials);

    /**
     * Whether the database is ready to perform
     * @type {boolean}
     */
    this.ready = false;

    this.on('error', (error) => {
      this.ready = false;
      throw error;
    });
  }

  connect() {
    return super.connect()
      .then(() => {
        this.ready = true;
      });
  }

  end() {
    this.ready = false;
    return super.end();
  }
}

module.exports = Database;
