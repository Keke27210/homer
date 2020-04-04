const { readdirSync } = require('fs');
const { resolve } = require('path');

const Manager = require('./Manager');

class CommandManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Base directory for commands
     * @type {string}
     */
    this.commandDirectory = resolve(this.srcDirectory, 'commands');

    /**
     * Base permissions for the bot to behave correctly
     * @type {string[]}
     */
    this.basePermissions = ['SEND_MESSAGES', 'EMBED_LINKS'];

    /**
     * Command categories
     * @type {string[]}
     */
    this.categories = ['bot', 'general', 'owner'];

    /**
     * Registered commands
     * @type {Command[]}
     */
    this.commands = [];
  }

  /**
   * Default command prefixes
   * @type {string[]}
   */
  get prefixes() {
    return [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`, 'hb:'];
  }

  /**
   * Registers all available commands into the client
   * @returns {number} Number of registered commands
   */
  registerCommands() {
    let i = 0;
    for (let j = 0; j < this.categories.length; j += 1) {
      const categoryPath = resolve(this.commandDirectory, this.categories[i]);
      const dirContent = readdirSync(categoryPath);
      for (let k = 0; k < dirContent.length; k += 1) {
        const command = new (require(resolve(categoryPath, dirContent[k])))(this.client);
        this.commands.push(command);
        i += 1;
      }
    }
    return i;
  }

  /**
   * Unregisters commands loaded in memory
   */
  unregisterCommands() {
    while (this.commands.length) this.commands.pop();
  }

  /**
   * Calls unregisterCommands() then registerCommands()
   * @returns {number} Number of registered commands
   */
  reloadCommands() {
    this.unregisterCommands();
    return this.registerCommands();
  }

  /**
   * Handles a command execution
   * @param {Message} message Message that triggered the command
   */
  async handleMessage(message) {
    if (message.author.bot || !message.content) return;
    await message.fetchSettings();

    const prefix = this.prefixes
      .concat(message.settings.prefixes)
      .find((p) => message.content.startsWith(p));
    if (!prefix) return;

    const parse = message.content.substring(prefix.length).trim();
    const args = parse.split(/ +/g);
    const command = args.shift();

    const instance = this.searchCommand(command);
    if (!instance) return;

    instance.run(message, args);
  }

  /**
   * Searches for a command
   * @param {string} search Search string
   * @returns {?Command} Found command
   */
  searchCommand(search) {
    const lowSearch = search.toLowerCase();
    return this.commands.find((c) => c.name === lowSearch || c.aliases.includes(lowSearch));
  }
}

module.exports = CommandManager;
