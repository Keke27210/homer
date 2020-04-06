class Command {
  constructor(client, category, commandInfo) {
    /**
     * Client that instantied this command
     * @type {DiscordClient}
     */
    this.client = client;

    /**
     * Name for the command
     * @type {string}
     */
    this.name = commandInfo.name;

    /**
     * Aliases for the command
     * @type {string[]}
     */
    this.aliases = commandInfo.aliases || [];

    /**
     * Category of the command
     * @type {string}
     */
    this.category = category;

    /**
     * Children for this command
     * @type {Command[]}
     */
    this.children = commandInfo.children || [];

    /**
     * User permissions required to run the command
     * @type {string[]}
     */
    this.userPermissions = commandInfo.userPermissions || [];

    /**
     * Bot permissions required to run the command
     * @type {string[]}
     */
    this.botPermissions = commandInfo.botPermissions
      ? this.client.commandManager.basePermissions.concat(commandInfo.botPermissions)
      : this.client.commandManager.basePermissions;

    /**
     * Whether this command is private
     * @type {boolean}
     */
    this.private = commandInfo.private || false;

    /**
     * Whether the command can be ran in a DM environment
     * @type {boolean}
     */
    this.dm = commandInfo.dm || false;
  }

  /**
   * Whether this command category requires a working database
   * @type {boolean}
   */
  get databaseRequired() {
    return ['radio', 'telephone'].includes(this.category);
  }

  /**
   * Performs the required checks then performs the command
   * @param {Message} message Message that triggered the command
   */
  async run(message, args) {
    const children = args[0];
    if (children) {
      const subcommand = this.children
        .find((c) => c.name === children || c.aliases.includes(children));
      if (subcommand) {
        args.shift();
        subcommand.run(message, args);
        return;
      }
    }

    if (this.private && !this.client.owners.includes(message.author.id)) return;

    if (!message.guild && !this.dm) {
      message.error(message._('command.noDm'));
      return;
    }

    if (message.guild) {
      const missingUser = message.member.permissions.missing(this.userPermissions);
      if (missingUser.length) {
        message.warn(message._('command.userPermissions', missingUser.map((p) => `\`${p}\``).join(', ')));
        return;
      }

      const missingBot = message.guild.me.permissions.missing(this.botPermissions);
      if (missingBot.length) {
        message.warn(message._('command.botPermissions', missingBot.map((p) => `\`${p}\``).join(', ')));
        return;
      }
    }

    if (this.databaseRequired && !this.client.database.ready) {
      message.error(message._('database.notReady'));
      return;
    }

    try {
      await this.main(message, args);
    } catch (e) {
      message.error(message._('command.error', e));
      this.client.logger.error(`[command->${this.name}] content: ${message.content} - author: ${message.author.id} - guild: ${message.guild ? message.guild.id : 'none'}`, e);
    }
  }

  /**
   * Default main entry point for the command (should be replaced)
   * @param {Message} message Message that triggered the command
   * @returns {?number} Error code
   */
  async main() {
    this.client.logger.warn(`[command->${this.name}] no custom main function`);
  }
}

module.exports = Command;
