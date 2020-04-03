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
    await this.database.connect()
      .catch(() => {
        this.logger.warn('[database] Running in no-database mode');
      });

    this.commandManager.registerCommands();
    this.eventManager.registerEvents();
    this.localeManager.registerLocales();
  }
}

module.exports = DiscordClient;
