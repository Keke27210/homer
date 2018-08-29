const Command = require('../../structures/Command');
const { Util } = require('discord.js');

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      category: 'bot',
      dm: true,
    });
  }

  async execute(context) {
    const helpMessage = [
      context.__('help.title', { name: this.client.user.username }),
      '\n',
      '\n',
    ];

    for (const category of this.client.commands.categories.filter(c => c !== 'owner')) {
      const categoryMessage = [`${this.client.constants.categoryEmotes[category]} **${context.__(`help.category.${category}`)}**`];

      const commands = this.client.commands.commands
        .filter(c => c.category === category && !c.hidden)
        .sort((a, b) => a.name.localeCompare(b.name));
      commands.forEach((command) => {
        categoryMessage.push(`\`${this.client.prefix}${command.name}${command.usage ? ` ${command.usage}` : ''}\` - ${this.client.localization.hasKey(context.settings.misc.locale, `helpUtil.${command.name}`) ? context.__(`helpUtil.${command.name}`) : context.__('helpUtil.noDescription')}`);
      });

      helpMessage.push(
        categoryMessage.join('\n'),
        '\n',
        '\n',
      );
    }

    helpMessage.push(context.__('help.advancedHelp', { command: `${this.client.prefix}command help` }));

    let ok = true;
    const msgs = Util.splitMessage(helpMessage.join(''), { char: '\n\n' });

    for (const msg of msgs) {
      if (!ok) break;
      await context.message.author.send(msg).catch(() => {
        ok = false;
      });
    }

    if (ok) context.reactSuccess();
    else context.replyError(context.__('commandHandler.help.cannotSend'));
  }
}

module.exports = HelpCommand;
