const request = require('superagent');
const Command = require('../../structures/Command');

class GoogleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'google',
      aliases: ['g', 'search'],
      usage: '<search>',
      category: 'general',
      dm: true,
    });
  }

  async execute(context) {
    const query = encodeURIComponent(context.args.join(' '));
    if (!query) return context.replyError(context.__('google.noSearch'));
    if (query.length > 256) return context.replyWarning(context.__('google.searchTooLong'));

    const message = await context.replyLoading(context.__('global.loading'));

    request
      .get(`https://www.googleapis.com/customsearch/v1?key=${this.client.config.api.googleKey}&cx=${this.client.config.api.googleCx}&lr=lang_${context.settings.misc.locale.split('-')[0]}&num=1&filter=1&safe=${context.message.channel.nsfw ? 'off' : 'high'}&fields=queries(request(totalResults)),items(link)&q=${query}`)
      .then((response) => {
        const body = response.body;
        if (!body.queries) return message.edit(`${this.client.constants.emotes.error} ${context.__('google.error.unknown')}`);
        if (body.queries.request[0].totalResults === '0') return message.edit(`${this.client.constants.emotes.error} ${context.__('google.error.noResult')}`);

        message.edit(context.__('google.result', {
          mention: `<@${context.message.member.nickname ? '!' : ''}${context.message.author.id}>`,
          link: body.items[0].link,
        }));
      })
      .catch(() => message.edit(`${this.client.constants.emotes.error} ${context.__('google.error.unknown')}`));
  }
}

module.exports = GoogleCommand;
