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
    const donators = this.client
      .guilds.get('382951433378594817')
      .roles.get('382967473135288320')
      .members
        .filter(m => !this.client.config.owners.includes(m.user.id))
        .sort((a, b) => a > b)
        .map(m => `${this.dot} **${m.user.username}**#${m.user.discriminator}`)
        .join('\n');

    const perks = Object.keys(this.client.localization.locales['en-gb'])
      .filter(key => key.startsWith('donators.perk.'))
      .map(key => `${this.dot} ${context.__(key)}`)
      .join('\n');

    const embed = new RichEmbed()
      .setDescription(context.__('donators.text', { link: this.client.constants.donationLink(context.message.author.id) }))
      .addField(context.__('donators.donators'), donators || context.__('global.none'), true)
      .addField(context.__('donators.perks'), perks || context.__('global.none'), true);

    context.reply(context.__('donators.main', { name: this.client.user.username }), { embed });
  }
}

module.exports = DonatorsCommand;
