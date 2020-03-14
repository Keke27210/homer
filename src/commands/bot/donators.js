const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class DonatorsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'donators',
      aliases: ['donate', 'donations'],
      category: 'bot',
      dm: true,
    });
  }

  async execute(context) {
    
    const donatorList = await this.client.database.getDocuments('donators', true);
    const donators = [];
    for (let i = 0; i < donatorList; i += 1) {
      const user = this.client.fetchUser(donatorList[i].id)
        .catch(() => null);
      if (!user) {
        donators.push(`${this.dot} **?**#?`);
        continue;
      }
      donators.push(`${this.dot} **${m.user.username}**#${m.user.discriminator}`);
    }

    const perks = Object.keys(this.client.localization.locales['en-gb'])
      .filter(key => key.startsWith('donators.perk.'))
      .map(key => `${this.dot} ${context.__(key)}`)
      .join('\n');

    const embed = new RichEmbed()
      .setDescription(context.__('donators.text', { link: this.client.constants.donationLink(context.message.author.id) }))
      .addField(context.__('donators.donators'), donators.sort((a, b) => a.localeCompare(b)).join('\n') || context.__('global.none'), true)
      .addField(context.__('donators.perks'), perks || context.__('global.none'), true);

    context.reply(context.__('donators.main', { name: this.client.user.username }), { embed });
  }
}

module.exports = DonatorsCommand;
