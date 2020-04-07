const { Client } = require('discord.js');

// Structures
const Database = require('./Database');
const Logger = require('./Logger');

// Managers
const AudioManager = require('../managers/AudioManager');
const CommandManager = require('../managers/CommandManager');
const EventManager = require('../managers/EventManager');
const LocaleManager = require('../managers/LocaleManager');

// Providers
const APIProvider = require('../providers/APIProvider');
const CallProvider = require('../providers/CallProvider');
const ContractProvider = require('../providers/ContractProvider');
const PhonebookProvider = require('../providers/PhonebookProvider');
const RadioProvider = require('../providers/RadioProvider');
const SettingProvider = require('../providers/SettingProvider');
const TrackingProvider = require('../providers/TrackingProvider');

// Utils
const FinderUtil = require('../util/FinderUtil');
const MenuUtil = require('../util/MenuUtil');

class DiscordClient extends Client {
  constructor(clientOptions, databaseCredentials, owners) {
    super(clientOptions);

    /**
     * Discord IDs of Homer owner(s)
     * @type {string[]}
     */
    this.owners = owners || [];

    /**
     * Whether the client is ready to proceed commands and events
     * @type {boolean}
     */
    this.ready = false;

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
     * Audio manager for this client
     * @type {AudioManager}
     */
    this.audioManager = new AudioManager(this);

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
     * API provider for this client
     * @type {APIProvider}
     */
    this.apis = new APIProvider(this);

    /**
     * Telephone manager for this client
     * @type {object}
     */
    this.telephone = {
      /**
       * Call provider for this telephone
       * @type {CallManager}
       */
      calls: new CallProvider(this),

      /**
       * Contract provider for this telephone
       * @type {ContractManager}
       */
      contracts: new ContractProvider(this),

      /**
       * Phonebook provider for this telephone
       * @type {PhonebookProvider}
       */
      phonebook: new PhonebookProvider(this),
    };

    /**
     * Radio provider for this client
     * @type {RadioProvider}
     */
    this.radios = new RadioProvider(this);

    /**
     * Setting provider for this client
     * @type {SettingProvider}
     */
    this.settings = new SettingProvider(this);

    /**
     * Tracking provider for this client
     * @type {TrackingProvider}
     */
    this.tracking = new TrackingProvider(this);

    /**
     * Finder util for this client
     * @type {FinderUtil}
     */
    this.finderUtil = new FinderUtil(this);

    /**
     * Menu util for this client
     * @type {MenuUtil}
     */
    this.menuUtil = new MenuUtil(this);

    // minutely tasks
    this.once('ready', () => {
      this.setInterval(() => this.minute(), 60000);
    });

    // node.js related
    process.on('uncaughtException', (error) => {
      this.logger.error('[uncaughtException] FATAL - SHUTTING DOWN - Uncaught exception:', error);
      this.shutdown(-1);
    });

    process.on('unhandledRejection', (error) => {
      if (error.message === 'UNAVAILABLE_DATABASE' && !this.database.ready) return; // Ignore these because we already know that
      this.logger.error('[unhandledRejection] An unhandled promise rejection was caught!', error);
    });
  }

  /**
   * Synchronously initializes all dynamic components
   */
  async initialize() {
    this.logger.log('[database] Connecting to the database...');
    await this.database.connect()
      .then(() => this.logger.log('[database] Connected successfully'))
      .catch(() => this.logger.warn('[database] Unable to connect - Running in no-database mode'));

    if (this.database.ready) {
      this.logger.log('[database] Creating database tables');
      await this.apis.createTable();
      await this.radios.createTable();
      await this.settings.createTable();
      await this.telephone.calls.createTable();
      await this.telephone.contracts.createTable();
      await this.telephone.phonebook.createTable();
      await this.tracking.createTable();
      this.logger.log('[database] Database tables created');
    }

    this.logger.log('[managers] Registering components...');
    this.commandManager.registerCommands();
    this.eventManager.registerEvents();
    this.localeManager.registerLocales();
    this.logger.log('[managers] Components registered');
  }

  /**
   * Gracefully shutdown the process with the given exit code
   * @param {?number} code Exit code (default: 0)
   */
  async shutdown(code = 0) {
    this.database.ready = false;

    this.logger.log('[managers] Unregistering components...');
    this.commandManager.unregisterCommands();
    this.eventManager.unregisterEvents();
    this.localeManager.unregisterLocales();
    this.logger.log('[managers] Components unregistered');

    if (this.database.connection.stream.readyState !== 'closed') {
      this.logger.log('[database] Ending connection with database...');
      await this.database.end()
        .then(() => this.logger.log('[database] Connection ended'))
        .catch(() => this.logger.error('[database] Unable to end database connection'));
    }

    this.logger.log('[gateway] Logging out Discord gateway...');
    this.destroy();

    this.logger.log(`[process] Exiting process with exit code ${code}`);
    process.exit(code);
  }

  /**
   * Sets the appropriate bot presence
   * @returns {Promise<Presence>}
   */
  updatePresence() {
    if (!this.user) return null;

    const presence = {
      status: this.database.ready ? 'online' : 'idle',
      activity: {
        type: 0,
        name: this.database.ready
          ? `Type h:help! On ${this.guilds.cache.size} servers with ${this.users.cache.size} users.`
          : '> Database unavailable - Some features may be disabled | Type h:help!',
      },
    };

    return this.user.setPresence(presence);
  }

  /**
   * Function ran every minute
   * Calls tasks that need to be done every minute
   */
  minute() {
    this.updatePresence();
    this.audioManager.minute();
    this.telephone.calls.minute();
  }
}

module.exports = DiscordClient;
