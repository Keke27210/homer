const Util = require('./Util');
const moment = require('moment');
const { appendFile } = require('fs');

class LoggerUtil extends Util {
  constructor(client) {
    super(client);
    this.LOG_PATH = './logs';
  }

  generateFilename(type) {
    const date = moment().format('DD-MM-YYYY');
    return `${type}/${this.client.shard.id}_${date}`;
  }

  info(message) {
    appendFile(`${this.LOG_PATH}/${this.generateFilename('info')}`, `[${new Date()}] ${message}\r\n\r\n`, (err) => {
      console.error(err);
    });
  }

  warn(message) {
    appendFile(`${this.LOG_PATH}/${this.generateFilename('warn')}`, `[${new Date()}] ${message}\r\n\r\n`, (err) => {
      console.error(err);
    });
  }

  error(message) {
    appendFile(`${this.LOG_PATH}/${this.generateFilename('error')}`, `[${new Date()}] ${message}\r\n\r\n`, (err) => {
      console.error(err);
    });
  }
}

module.exports = LoggerUtil;
