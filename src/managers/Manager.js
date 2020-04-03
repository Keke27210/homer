const { join } = require('path');

class Manager {
  constructor(client) {
    /**
     * Client that instantied this manager
     * @type {DiscordClient}
     */
    this.client = client;

    /**
     * Base directory for source code
     * @type {string}
     */
    this.srcDirectory = join(process.cwd(), 'src');
  }
}

module.exports = Manager;
