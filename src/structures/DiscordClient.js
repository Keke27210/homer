const { Client } = require('discord.js');

const Constants = require('../Constants');

// Structures
const Database = require('./Database');
const Logger = require('./Logger');

// Managers
const CommandManager = require('../managers/CommandManager');
const EventManager = require('../managers/EventManager');
const LavacordManager = require('../managers/LavacordManager');
const LisaManager = require('../managers/LisaManager');
const LocaleManager = require('../managers/LocaleManager');

// Providers
const APIProvider = require('../providers/APIProvider');
const CallProvider = require('../providers/CallProvider');
const ContractProvider = require('../providers/ContractProvider');
const PhonebookProvider = require('../providers/PhonebookProvider');
const RadioProvider = require('../providers/RadioProvider');
const SettingProvider = require('../providers/SettingProvider');
const TagProvider = require('../providers/TagProvider');
const TrackingProvider = require('../providers/TrackingProvider');

// Utils
const FinderUtil = require('../util/FinderUtil');
const ListUtil = require('../util/ListUtil');
const LogUtil = require('../util/LogUtil');
const MenuUtil = require('../util/MenuUtil');

class DiscordClient extends Client {
  constructor(clientOptions, databaseCredentials, lavalinkCredentials) {
    super(clientOptions);

    /**
     * Constants values for Homer
     * @type {Constants}
     */
    this.constants = Constants;

    /**
     * Presence overwrite for the bot
     * @type {PresenceData}
     */
    this.presenceOverwrite = null;

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
    this.logger = new Logger(this.shard.ids[0]);

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
     * Lavacord manager for this client
     * @type {LavacordManager}
     */
    this.lavacordManager = new LavacordManager(
      this,
      lavalinkCredentials.nodes,
      lavalinkCredentials.options,
    );

    /**
     * Lisa manager for this client
     * @type {LisaManager}
     */
    this.lisaManager = new LisaManager(this);

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
     * Tag provider for this client
     * @type {TagProvider}
     */
    this.tags = new TagProvider(this);

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
     * List util for this client
     * @type {ListUtil}
     */
    this.listUtil = new ListUtil(this);

    /**
     * Log util for this client
     * @type {LogUtil}
     */
    this.logUtil = new LogUtil(this);

    /**
     * Menu util for this client
     * @type {MenuUtil}
     */
    this.menuUtil = new MenuUtil(this);

    // tasks
    this.once('ready', () => {
      this.setInterval(() => this.minute(), (60 * 1000));
      this.setInterval(() => this.hour(), (60 * 60 * 1000));
    });

    // node.js related
    process.on('uncaughtException', (error) => {
      this.logger.error('[uncaughtException] FATAL - SHUTTING DOWN - Uncaught exception:', error);
      this.shutdown(-1);
    });

    process.on('unhandledRejection', (error) => {
      if (error.message === 'UNAVAILABLE_DATABASE' && !this.database.ready) return; // Ignore these because we already know that
      if (error.message.includes('tracking_pkey')) return; // I am aware of these errors
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
      await this.tags.createTable();
      await this.tracking.createTable();
      this.logger.log('[database] Database tables created');
    }

    this.logger.log('[managers] Registering components...');
    this.commandManager.registerCommands();
    this.eventManager.registerEvents();
    this.lisaManager.registerMethods();
    this.localeManager.registerLocales();
    this.logger.log('[managers] Components registered');
  }

  /**
   * Gracefully shutdown the process with the given exit code
   * @param {?number} code Exit code (default: 0)
   */
  async shutdown(code = 0) {
    this.logger.log('[telephone] Sending restart notifications to ongoing calls...');
    await this.telephone.calls.onShutdown();
    this.logger.log('[telephone] Notifications sent');

    this.logger.log('[radio] Informing users that the broadcast is interrupted');
    await this.radios.onShutdown();
    this.logger.log('[radio] Notifications sent');

    this.database.ready = false;

    this.logger.log('[managers] Unregistering components...');
    this.commandManager.unregisterCommands();
    this.eventManager.unregisterEvents();
    this.lisaManager.unregisterMethods();
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

    const shards = this.shard.ids;
    const presence = this.presenceOverwrite || {
      status: this.database.ready ? 'online' : 'idle',
      activity: {
        type: 2,
        name: this.database.ready
          ? `h:help | On ${this.guilds.cache.size} servers on shard${shards.length > 1 ? 's' : ''} ${shards.map((s) => s + 1).join('/')}.`
          : 'h:help /!\\ Database unavailable - Some features may be disabled',
      },
    };

    return this.user.setPresence(presence);
  }

  /**
   * Function ran every minute
   * Calls tasks that need to be done every minute
   */
  minute() {
    if (!this.ready) return;

    this.updatePresence();
    this.telephone.calls.minute();
  }

  /**
   * Funtion ran every hour
   * Calls tasks that need to be done every hour
   */
  hour() {
    if (!this.ready) return;

    this.listUtil.update();
  }
}

module.exports = DiscordClient;
