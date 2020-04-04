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
     * Registered commands
     * @type {Command[]}
     */
    this.commands = [];
  }

  /**
   * Registers all available commands into the client
   * @returns {number} Number of registered commands
   */
  registerCommands() {
    let i = 0;
    const dirContent = readdirSync(this.commandDirectory);
    while (i < dirContent.length) {
      const command = new (require(resolve(this.commandDirectory, dirContent[i])))(this.client);
      this.commands.push(command);
      i += 1;
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

    const args = message.content.split(/ +/g);
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
