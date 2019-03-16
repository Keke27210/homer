const Command = require('../../structures/Command');
const colors = ['RED', 'PINK', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'WHITE', 'DARK']

class DiscoverCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'discover',
      category: 'general',
      dm: true,
    });
  }

  async execute(context) {
    const guilds = await this.client.rest.makeRequest('get', '/guilds/discoverable', true)
      .then(list => shuffle(list));
    if (guilds.length === 0) return context.replyError(context.__('discover.noGuilds'));

    const entries = [];
    const pages = [];

    guilds.forEach((guild, index) => {
      const info = [
        `${this.dot} ${context.__('lookup.invite.embed.server')}: **${guild.name}**${invite.guild.features.includes('VERIFIED') ? ` ${this.client.constants.emotes.verifiedServer}` : ''}`,
        `${this.dot} ${context.__('server.embed.members')}: ${this.client.constants.status.online} **${guild.approximate_presence_count}**`,
        `${this.dot} ${context.__('server.embed.verificationLevel')}: **${context.__(`server.verificationLevel.${guild.verification_level}`)}**`
        `${this.dot} ${context.__('lookup.invite.embed.quickAccess')}:`
      ];

      if (guild.description) info.push(['', guild.description]);

      entries.push(info.join('\n'));
      pages.push({
        title: ' ',
        color: colors[Math.floor(Math.random() * colors.length)],
        image: `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png`,
        thumb: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
        footer: context.__('discover.footer', { count: `${index + 1}/${guilds.length}` }),
      });
    });

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('discover.main'),
      pages,
      entries,
      { entriesPerPage: 1 },
    );
  }
}

function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

module.exports = DiscoverCommand;
