const Command = require('../../structures/Command');

class DonatorsCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'donators',
      aliases: ['donations'],
      dm: true,
    });
  }

  async main(message) {
    const list = await this.client.settings.getRows([
      ['boost', '=', true],
    ]);

    const users = [];
    for (let i = 0; i < list.length; i += 1) {
      const user = await this.client.users.fetch(list[i].id)
        .catch(() => null);
      if (user) users.push(`${message.dot} ${user.tag}`);
    }

    const embed = message.getEmbed()
      .setDescription(message._('donators.message'))
      .addField(message._('donators.list'), users.sort((a, b) => a.localeCompare(b)).join('\n') || message._('global.none'), true)
      .addField(message._('donators.perks'), message._('donators.perkList').map((p) => `${message.dot} ${p}`).join('\n'), true);
    message.send(message._('donators.title'), embed);
  }
}

module.exports = DonatorsCommand;
