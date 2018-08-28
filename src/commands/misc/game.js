const { RichEmbed } = require('discord.js');
const request = require('superagent');
const mtz = require('moment-timezone');
const Command = require('../../structures/Command');

class GameCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'game',
      category: 'misc',
      usage: '<game>',
      dm: true,
    });
  }

  get baseURL() {
    return 'https://api-endpoint.igdb.com';
  }

  async execute(context) {
    const search = context.args.join(' ');
    if (!search) return context.replyError(context.__('game.noSearch'));
    if (search.length > 64) return context.replyWarning(context.__('game.searchTooLong'));
    const message = await context.replyLoading(context.__('global.loading'));

    // Auto-complete search
    const searchQuery = await request.get(`https://www.igdb.com/search_autocomplete_all?q=${encodeURIComponent(search)}`)
      .then(res => res.body)
      .catch(() => null);

    if (!searchQuery.game_suggest) {
      return message.edit(`${this.client.constants.emotes.warning} ${context.__('game.noResult', { search })}`);
    }

    const query = `/games/${searchQuery.game_suggest[0].id}`;
    const response = await request
      .get(`${this.baseURL}${query}`)
      .set('Accept', 'application/json')
      .set('user-key', this.client.config.api.igdb)
      .then(res => res.body[0])
      .catch(() => null);

    const publishers = [];
    for (const publisher of response.publishers || []) {
      const r = await request
        .get(`${this.baseURL}/companies/${publisher}`)
        .set('Accept', 'application/json')
        .set('user-key', this.client.config.api.igdb)
        .then(res => res.body[0])
        .catch(() => ({ name: '?' }));

      publishers.push(`**${r.name}**`);
    }

    const developers = [];
    for (const developer of response.developers || []) {
      const r = await snekfetch
        .get(`${this.baseURL}/companies/${developer}`)
        .set('Accept', 'application/json')
        .set('user-key', this.client.config.api.igdb)
        .then(res => res.body[0])
        .catch(() => ({ name: '?' }));

      developers.push(`**${r.name}**`);
    }

    const platforms = [];
    for (const platform of response.platforms || []) {
      const r = await snekfetch
        .get(`${this.baseURL}/platforms/${platform}`)
        .set('Accept', 'application/json')
        .set('user-key', this.client.config.api.igdb)
        .then(res => res.body[0])
        .catch(() => ({ name: '?' }));

      platforms.push(`**${r.name}**`);
    }

    const release = mtz(response.first_release_date)
      .tz(context.settings.misc.timezone)
      .locale(context.settings.misc.locale)
      .format(context.settings.misc.dateFormat);

    const embed = new RichEmbed()
      .setDescription([
        `${this.dot} ${context.__('game.embed.publishers')}: ${publishers.join(', ') || context.__('global.none')}`,
        `${this.dot} ${context.__('game.embed.developers')}: ${developers.join(', ') || context.__('global.none')}`,
        `${this.dot} ${context.__('game.embed.platforms')}: ${platforms.join(', ') || context.__('global.none')}`,
        `${this.dot} ${context.__('game.embed.release')}: **${release}**`,
      ].join('\n'))
      .addField(context.__('game.embed.description'), response.summary ? response.summary.substring(0, 1024) : context.__('game.embed.noDesc'))
      .setThumbnail(response.cover ? `https:${response.cover.url}` : undefined);

    message.edit(
      context.__('game.title', { name: `**${response.name}**` }),
      { embed },
    );
  }
}

module.exports = GameCommand;
