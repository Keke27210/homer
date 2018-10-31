const { Client } = require('discord.js');
const readdir = require('util').promisify(require('fs').readdir);
const DjsConstants = require('../../node_modules/discord.js/src/util/Constants');

// Managers
const CommandManager = require('../managers/CommandManager');
const DatabaseManager = require('../managers/DatabaseManager');
const LocaleManager = require('../managers/LocaleManager');
const LisaManager = require('../managers/LisaManager');

// Util
const Constants = require('../util/Constants');
const UpdateUtil = require('../util/UpdateUtil');
const FinderUtil = require('../util/FinderUtil');
const TimeUtil = require('../util/TimeUtil');
const HandlerUtil = require('../util/HandlerUtil');
const OtherUtil = require('../util/OtherUtil');

class DiscordClient extends Client {
  constructor(config) {
    super(config.client);
    this.config = config;
    this.constants = Constants;
    this.cooldown = {};
    this.events = [];
    this.voiceBroadcasts = {};
    this.ready = false;
    this.maintenance = false;

    this.commands = new CommandManager(this);
    this.database = new DatabaseManager(this);
    this.localization = new LocaleManager(this);
    this.lisa = new LisaManager(this);

    this.finder = new FinderUtil(this);
    this.time = new TimeUtil(this);
    this.update = new UpdateUtil(this);
    this.handler = new HandlerUtil(this);
    this.other = new OtherUtil(this);

    // Load events and commands
    this.loadEvents();
    this.commands.loadCommands();
  }

  get prefix() {
    return this.config.discord.prefixes[0];
  }

  __(locale, key, args) {
    return this.localization.translate(locale, key, args);
  }

  sendMessage(channel, content, { tts, nonce, embed } = {}, files = null) {
    content = content.replace(/@(everyone|here)/g, '@\u200b$1');
    return this.rest.makeRequest('post', DjsConstants.Endpoints.Channel(channel).messages, true, {
      content, tts, nonce, embed,
    }, files);
  }

  updateMessage(channel, message, content, embed) {
    content = content.replace(/@(everyone|here)/g, '@\u200b$1');
    return this.rest.makeRequest('patch', DjsConstants.Endpoints.Message({ id: message, channel }), true, {
      content, embed,
    });
  }

  deleteMessage(channel, message) {
    return this.rest.makeRequest('delete', DjsConstants.Endpoints.Message({ id: message, channel }), true);
  }

  async loadEvents(sandbox = false) {
    const eventFiles = await readdir('./src/events');
    for (const eventFile of eventFiles) {
      const event = new (require(`../events/${eventFile}`))(this);
      if (!sandbox) {
        this.events.push(event);
        this.on(event.name, (...args) => event.handle(...args));
      }
      this.clearCache(`../events/${eventFile}`);
    }
  }

  async reloadEvents(sandbox = false) {
    if (!sandbox) {
      for (const event of this.events) this.removeAllListeners(event.name);
      this.events = [];
    }
    await this.loadEvents(sandbox);
  }

  clearCache(moduleId) {
    const fullPath = require.resolve(moduleId);

    if (require.cache[fullPath] && require.cache[fullPath].parent) {
      let i = require.cache[fullPath].parent.children.length;

      while (i -= 1) {
        if (require.cache[fullPath].parent.children[i].id === fullPath) {
          require.cache[fullPath].parent.children.splice(i, 1);
        }
      }
    }

    delete require.cache[fullPath];
  }
}

module.exports = DiscordClient;
