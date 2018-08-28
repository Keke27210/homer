const Manager = require('../structures/Manager');
const Context = require('../structures/Context');
const readdir = require('util').promisify(require('fs').readdir);

class CommandManager extends Manager {
  constructor(client) {
    super(client);
    this.categories = this.client.config.commands.categories;
    this.commands = [];
  }

  async loadCommands(sandbox = false) {
    for (const category of this.categories) {
      const commandList = await readdir(`./src/commands/${category}`)
        .then(files => files.filter(f => f.split('.')[1] === 'js'));

      commandList.forEach((commandFile) => {
        const command = new (require(`../commands/${category}/${commandFile}`))(this.client);
        if (!sandbox) this.commands.push(command);
        this.client.clearCache(`../commands/${category}/${commandFile}`);
      });
    }
  }

  async reloadCommands(sandbox = false) {
    if (!sandbox) this.commands = [];
    await this.loadCommands(sandbox);
  }

  async handleCommand(message) {
    if (message.author.bot || !message.content) return;

    const context = new Context(this.client, message);
    await context.getSettings();

    const prefixes = this.client.config.discord.prefixes.concat(context.settings.prefixes);
    const prefix = prefixes.find((p) => {
      if (context.message.content.toLowerCase().startsWith(p)) {
        context.prefix = p;
        return true;
      }
    });
    if (!prefix) return;
    context.args = context.args
      .join(' ')
      .slice(prefix.length)
      .trim()
      .split(' ');

    const cmdSearch = (context.args[0] || '').toLowerCase();
    const command = this.getCommand(cmdSearch);

    if (command) {
      context.args.shift();
      command.run(context);
    } else if (context.settings.importedTags.includes(cmdSearch)) {
      const tagCommand = this.getCommand('tag');
      if (!tagCommand) return;
      tagCommand.run(context);
    } else if (context.prefix === `<@${context.guild && context.guild.me.nickname ? '!' : ''}${this.client.user.id}>`) {
      this.client.other.handleCleverbot(context);
    }
  }

  getCommand(name) {
    return this.commands.find(c => c.name === name.toLowerCase() || c.aliases.includes(name.toLowerCase())) || null;
  }

  async getSettings(id = '0') {
    const data = await this.client.database.getDocument('guildSettings', id);
    return data || this.client.constants.defaultGuildSettings(id);
  }
}

module.exports = CommandManager;
