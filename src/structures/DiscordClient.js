const { Client } = require('discord.js');

// Structures
const Database = require('./Database');
const Logger = require('./Logger');

// Managers
const CommandManager = require('../managers/CommandManager');
const EventManager = require('../managers/EventManager');
const LocaleManager = require('../managers/LocaleManager');

class DiscordClient extends Client {
  constructor(clientOptions, databaseCredentials) {
    super(clientOptions);

    /**
     * Discord IDs of Homer owner(s)
     * @type {string[]}
     */
    this.owners = clientOptions.owners || [];

    /**
     * Database for this Discord client
     * @type {Database}
     */
    this.database = new Database(databaseCredentials);

    /**
     * Logger for this client
     * @type {Logger}
     */
    this.logger = new Logger();

    /**
     * Command manager for this client
     * @type {CommandManager}
     */
    this.commandManager = new CommandManager(this);

    /**
     * Event manager for this client
     * @type {EventManager}
     */
    this.eventManager = new EventManager(this);

    /**
     * Locale manager for this client
     * @type {LocaleManager}
     */
    this.localeManager = new LocaleManager(this);
  }

  /**
   * Synchronously initializes all dynamic components
   */
  async initialize() {
    this.logger.log('[client] Connecting to the database...');
    await this.database.connect()
      .catch(() => {
        this.logger.warn('[database] Unable to connect - Running in no-database mode');
      });

    this.logger.log('[client] Registering components...');
    this.commandManager.registerCommands();
    this.eventManager.registerEvents();
    this.localeManager.registerLocales();
  }

  /**
   * Gracefully shutdown the process with the given exit code
   * @param {number} code Exit code
   */
  async shutdown(code = 0) {
    this.logger.log('[client] Unregistering components...');
    this.commandManager.unregisterCommands();
    this.eventManager.unregisterEvents();
    this.localeManager.unregisterLocales();

    this.logger.log('[client] Ending connection with database...');
    await this.database.end()
      .catch(() => {
        this.logger.error('[database] Unable to end database connection');
      });

    this.logger.log('[client] Logging out Discord gateway...');
    this.destroy();

    this.logger.log(`[client] Exiting process with exit code ${code}`);
    process.exit(code);
  }
}

module.exports = DiscordClient;
