const {
  appendFileSync,
  existsSync,
  mkdirSync,
  statSync,
} = require('fs');
const { resolve } = require('path');
const { format } = require('util');
const moment = require('moment-timezone');
require('colors');

class Logger {
  constructor() {
    /**
     * Base directory for log files
     * @type {string}
     */
    this.baseDirectory = resolve(process.cwd(), 'logs');

    /**
     * Whether print/write debug information
     * @type {boolean}
     */
    this.debugEnabled = false;

    /**
     * Whether use colors in console
     * @type {boolean}
     */
    this.useColors = true;

    /**
     * Colors for each log severity (background | foreground)
     * @type {function[][]}
     */
    this.colors = [
      [(str) => str.bgCyan, (str) => str.cyan, 'DEBUG', 'debug'],
      [(str) => str.bgBlack.white, (str) => str.bgBlack.white, 'LOG  ', 'log'],
      [(str) => str.bgYellow.black, (str) => str.bgBlack.yellow, 'WARN ', 'warn'],
      [(str) => str.bgRed.black, (str) => str.bgBlack.red, 'ERROR', 'error'],
    ];

    this.checkBase();
  }

  /**
   * Toggles color usage
   * @returns {boolean} New state
   */
  toggleColors() {
    if (this.useColors) this.useColors = false;
    else this.useColors = true;
    return this.useColors;
  }

  /**
   * Checks if the base "logs" directory exists
   * and creates it if not
   */
  checkBase() {
    if (!existsSync(this.baseDirectory) || !statSync(this.baseDirectory).isDirectory()) {
      mkdirSync(this.baseDirectory);
    }
  }

  /**
   * Writes into console
   * @param {string} time Log time
   * @param {string} content Log content
   * @param {number} severity Log severity
   */
  writeConsole(time, content, severity) {
    if (severity === 0 && !this.debugEnabled) return;
    const str = this.useColors
      ? `${this.colors[severity][0](time)} ${this.colors[severity][1](content)}`
      : `${time} ${this.colors[severity][2]} ${content}`;
    const output = severity >= 2 ? process.stderr : process.stdout;
    output.write(`${str}\n`);
  }

  /**
   * Writes into a file
   * @param {string} time Log time
   * @param {string} content Log content
   * @param {number} severity Log severity
   */
  writeFile(time, content, severity) {
    const path = this.genPath();
    const str = `${time} ${content}\n`;
    appendFileSync(resolve(path, `${this.colors[severity][3]}.log`), str);
  }

  /**
   * Generates a nicely formatted time
   * @param {?Moment} time Moment object to use
   * @returns {string} Formatted time
   */
  // eslint-disable-next-line class-methods-use-this
  genTime(time) {
    return `[${(time || moment()).format('HH:mm:ss')}]`;
  }

  /**
   * Generate log information to output
   * @param {number} severity Log severity
   * @param {string} content Log content
   */
  genLog(severity, content) {
    const now = moment();
    const time = this.genTime(now);
    this.writeConsole(time, format(content), severity);
    this.writeFile(time, format(content), severity);
  }

  /**
   * Generates a valid path for log files using YYYY/MM/DD architecture
   * @returns {string}
   */
  genPath() {
    const now = new Date();

    let path = resolve(this.baseDirectory, now.getUTCFullYear().toString());
    if (!existsSync(path) || !statSync(path).isDirectory()) {
      mkdirSync(path);
    }

    path = resolve(path, (now.getUTCMonth() + 1).toString());
    if (!existsSync(path) || !statSync(path).isDirectory()) {
      mkdirSync(path);
    }

    path = resolve(path, now.getUTCDate().toString());
    if (!existsSync(path) || !statSync(path).isDirectory()) {
      mkdirSync(path);
    }

    return path;
  }

  /**
   * Treats the given information as an error
   * @param {string} str Message to log
   * @param {?Error} error Error object
   */
  error(str, error) {
    let errStr = str;
    if (typeof error === 'object' && 'stack' in error) {
      errStr += `\n${error.stack}`;
    }

    this.genLog(3, errStr);
  }

  /**
   * Treats the given information as a warn
   * @param {string} str Message to log
   */
  warn(str) {
    this.genLog(2, str);
  }

  /**
   * Treats the given information as a log
   * @param {string} str Message to log
   */
  log(str) {
    this.genLog(1, str);
  }

  /**
   * Treats the given information as a debug
   * @param {string} str Message to log
   */
  debug(str) {
    this.genLog(0, str);
  }
}

module.exports = Logger;
