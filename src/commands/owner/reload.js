const Command = require('../../structures/Command');

class ReloadCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reload',
      category: 'owner',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    // To avoid bad surprises, we reload once locally events and commands here
    // and check for possible errors BEFORE pushing the action to every shard.

    try {
      await this.client.reloadEvents(true);
      await this.client.commands.reloadCommands(true);
      await this.client.localization.reloadLocales(true);
      await this.client.lisa.reloadMethods(true);
      await this.client.reloadRoutines(true);
    } catch (e) {
      return context.replyError(`Error during execution of the reload!\n\`\`\`js\n${e.stack}\`\`\``);
    }

    const message = await context.replyWarning('Local reload has complete successfully! Asking to all shards to proceed...');
    this.client.shard.broadcastEval('this.reloadEvents(); this.commands.reloadCommands(); this.localization.reloadLocales(); this.lisa.reloadMethods(); this.reloadRoutines();')
      .then(() => message.edit(`${this.client.constants.emotes.success} Reload has complete successfully!`))
      .catch(e => message.edit(`${this.client.constants.emotes.error} Error during execution of the reload!\n\`\`\`${e.stack}\`\`\``));
  }
}

module.exports = ReloadCommand;
