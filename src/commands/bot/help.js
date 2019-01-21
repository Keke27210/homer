const Command = require('../../structures/Command');

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      category: 'bot',
      dm: true,
    });
  }

  async execute(context) {
    try {
      const entries = [];
      const pages = [];

      for (const category of this.client.commands.categories) {
        if (category === 'owner') continue;
        const msg = [`${this.client.constants.categoryEmotes[category]} **${context.__(`help.category.${category}`)}**`, ''];

        const commands = this.client.commands.commands
          .filter(c => c.category === category && !c.hidden)
          .sort((a, b) => a.name.localeCompare(b.name));
        commands.forEach(c => msg.push(`${this.dot} \`${this.client.prefix}${c.name}\` - ${this.client.localization.hasKey(context.settings.misc.locale, `helpUtil.${c.name}`) ? context.__(`helpUtil.${c.name}`) : context.__('helpUtil.noDescription')}`));

        entries.push(msg.join('\n'));
        pages.push({ color: this.client.constants.categoryColors[category] });
      }

      const channel = await context.message.author.createDM();
      await this.client.menu.createMenu(
        channel.id,
        context.message.author.id,
        context.message.id,
        context.settings.misc.locale,
        context.__('help.main', { name: this.client.user.username }),
        pages,
        entries,
        { entriesPerPage: 1, footer: context.__('help.footer') },
      ).then(() => {
        context.reactSuccess();
      });
    } catch (e) {
      context.replyError(context.__('commandHandler.help.cannotSend'));
    }
  }

  get categoryColors() {
    return ({
      bot: 'YELLOW',
      general: 'BLUE',
      misc: 'ORANGE',
      settings: 'GREY',
      telephone: 'RED',
    });
  }
}

module.exports = HelpCommand;
