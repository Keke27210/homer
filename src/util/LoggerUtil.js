const Util = require('./Util');
const moment = require('moment');
const { appendFile } = require('fs');

class LoggerUtil extends Util {
  constructor(client) {
    super(client);
    this.LOG_PATH = './logs';
  }

  prefixTime() {
    return moment().tz('UTC').format('HH:mm:ss.SSS');
  }

  generateFilename(type) {
    const date = moment().tz('UTC').format('DD-MM-YYYY');
    return `${type}/${this.client.shard.id}_${date}`;
  }

  info(message) {
    appendFile(`${this.LOG_PATH}/${this.generateFilename('info')}`, `[${this.prefixTime()}] ${message}\r\n`, (err) => {
      if (err) console.error(err);
    });
  }

  warn(message) {
    //this.client.other.ilAFreeIlAToutCompris(message);
    appendFile(`${this.LOG_PATH}/${this.generateFilename('warn')}`, `[${this.prefixTime()}] ${message}\r\n`, (err) => {
      if (err) console.error(err);
    });
  }

  error(message) {
    this.client.other.ilAFreeIlAToutCompris(message);
    appendFile(`${this.LOG_PATH}/${this.generateFilename('error')}`, `[${this.prefixTime()}] ${message}\r\n`, (err) => {
      if (err) console.error(err);
    });
  }
}

module.exports = LoggerUtil;
