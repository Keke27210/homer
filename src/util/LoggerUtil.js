const Util = require('./Util');
const moment = require('moment');
const { appendFile } = require('fs');

class LoggerUtil extends Util {
  constructor(client) {
    super(client);
    this.LOG_PATH = './logs';
  }

  prefixTime() {
    const date = new Date();
    return `[${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}]`;
  }

  generateFilename(type) {
    const date = moment().format('DD-MM-YYYY');
    return `${type}/${this.client.shard.id}_${date}`;
  }

  info(message) {
    appendFile(`${this.LOG_PATH}/${this.generateFilename('info')}`, `[${this.prefixTime()}] ${message}\r\n`, (err) => {
      if (err) console.error(err);
    });
  }

  warn(message) {
    appendFile(`${this.LOG_PATH}/${this.generateFilename('warn')}`, `[${this.prefixTime()}] ${message}\r\n`, (err) => {
      if (err) console.error(err);
    });
  }

  error(message) {
    appendFile(`${this.LOG_PATH}/${this.generateFilename('error')}`, `[${this.prefixTime()}] ${message}\r\n`, (err) => {
      if (err) console.error(err);
    });
  }
}

module.exports = LoggerUtil;
