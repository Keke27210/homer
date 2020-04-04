const { Client } = require('discord.js');

// Structures
const Database = require('./Database');
const Logger = require('./Logger');

// Managers
const CommandManager = require('../managers/CommandManager');
const EventManager = require('../managers/EventManager');
const LocaleManager = require('../managers/LocaleManager');
const TelephoneManager = require('../managers/TelephoneManager');

// Utils
const FinderUtil = require('../util/FinderUtil');
const SettingsUtil = require('../util/SettingsUtil');

class DiscordClient extends Client {
  constructor(clientOptions, databaseCredentials, apiKeys) {
    super(clientOptions);

    /**
     * Discord IDs of Homer owner(s)
     * @type {string[]}
     */
    this.owners = clientOptions.owners || [];

    /**
     * API keys used by Homer
     * @type {object}
     */
    this.apiKeys = apiKeys;

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

    /**
     * Telephone manager for this client
     * @type {TelephoneManager}
     */
    this.telephoneManager = new TelephoneManager(this);

    /**
     * Finder util for this client
     * @type {FinderUtil}
     */
    this.finderUtil = new FinderUtil(this);

    /**
     * Settings util for this client
     * @type {SettingsUtil}
     */
    this.settingsUtil = new SettingsUtil(this);
  }

  /**
   * Synchronously initializes all dynamic components
   */
  async initialize() {
    this.logger.log('[database] Connecting to the database...');
    await this.database.connect()
      .then(() => {
        this.logger.log('[database] Connected successfully');
      })
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
   * @param {?number} code Exit code (default: 0)
   */
  async shutdown(code = 0) {
    this.logger.log('[client] Unregistering components...');
    this.commandManager.unregisterCommands();
    this.eventManager.unregisterEvents();
    this.localeManager.unregisterLocales();

    if (this.database.connection.stream.readyState !== 'closed') {
      this.logger.log('[database] Ending connection with database...');
      await this.database.end()
        .catch(() => {
          this.logger.error('[database] Unable to end database connection');
        });
    }

    this.logger.log('[gateway] Logging out Discord gateway...');
    this.destroy();

    this.logger.log(`[process] Exiting process with exit code ${code}`);
    process.exit(code);
  }
}

module.exports = DiscordClient;
