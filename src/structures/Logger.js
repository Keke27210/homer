const { join } = require('path');

class Logger {
  constructor() {
    /**
     * Base directory for log files
     * @type {string}
     */
    this.baseDirectory = join(process.cwd(), 'logs');
  }

  /**
   * Logs a message into the standard output
   * @param {string} string String to output
   */
  info(string) {
    process.stdout.write(`${string}\n`);
  }

  /**
   * Prints a warning
   * @param {} string Message to print
   */
  warn(string) {
    process.stdout.write(`${string}\n`);
  }

  /**
   * Prints an error
   * @param {string} string Message to print
   * @param {Error} error Error to extract stack from
   */
  error(string, error) {
    console.error(string, error);
  }
}

module.exports = Logger;
