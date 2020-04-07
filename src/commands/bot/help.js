const Command = require('../../structures/Command');

class HelpCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'help',
      dm: true,
    });

    this.colors = {
      bot: 0xFFFF00,
      general: 'BLUE',
      radio: 'PURPLE',
      settings: 'GREY',
      telephone: 'RED',
    };
  }

  async main(message) {
    const entries = [];
    const pages = [];

    for (let i = 0; i < this.client.commandManager.categories.length; i += 1) {
      const category = this.client.commandManager.categories[i];
      // eslint-disable-next-line no-continue
      if (category === 'owner') continue;

      const msg = [`${message.emote(`c_${category}`)} **${message._(`help.category.${category}`)}**`, ''];
      this.client.commandManager.commands
        .filter((c) => c.category === category && !c.hidden)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((c) => {
          msg.push(`${message.dot} \`h:${c.name}\` - ${message._(`help.${c.name}.description`)}`);
        });

      entries.push(msg.join('\n'));
      pages.push({ title: ' ', color: this.colors[category] });
    }

    entries.push([
      `❔ **${message._('help.category.more')}**`,
      '',
      message._('help.more', this.client.invite),
    ].join('\n'));
    pages.push({ title: ' ', color: 0xFFFF00 });

    const channel = await message.author.createDM();
    await this.client.menuUtil.createMenu(
      channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('help.main'),
      pages,
      entries,
      { entriesPerPage: 1, footer: message._('help.footer') },
    )
      .then(() => {
        message.reactSuccess();
      })
      .catch(() => {
        message.error(message._('help.cannot'));
      });
  }
}

module.exports = HelpCommand;
