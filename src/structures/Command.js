class Command {
  constructor(client, commandInfo) {
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
   * Performs the required checks then performs the command
   * @param {Message} message Message that triggered the command
   */
  run(message, args) {
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
      message.channel.send('❌ You can\'t execute this command in a DM environment.');
      return;
    }

    if (message.guild) {
      const missingUser = message.member.permissions.missing(this.userPermissions);
      if (missingUser.length) {
        message.channel.send(`⚠️ You need the following permissions to run this command: ${missingUser.map((p) => `\`${p}\``).join(', ')}.`);
        return;
      }

      const missingBot = message.guild.me.permissions.missing(this.botPermissions);
      if (missingBot.length) {
        message.channel.send(`⚠️ I need the following permissions to run this command: ${missingBot.map((p) => `\`${p}\``).join(', ')}.`);
        return;
      }
    }

    this.main(message, args);
  }

  /**
   * Default main entry point for the command (should be replaced)
   * @param {Message} message Message that triggered the command
   * @returns {number} Error code
   */
  main() {
    this.client.logger.warn(`[command->${this.name}] no custom main function`);
  }
}

module.exports = Command;
