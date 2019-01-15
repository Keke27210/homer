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
    const data = await this.client.api.getGoogle(query, { lr: context.settings.misc.locale, safe: context.message.channel.nsfw ? 'off' : 'high' });
    if (typeof data === 'number') return message.edit(`${this.client.constants.emotes.error} ${context.__('google.error.unknown')}`);
    if (!data.queries) return message.edit(`${this.client.constants.emotes.error} ${context.__('google.error.unknown')}`);
    if (data.queries.request[0].totalResults === '0') return message.edit(`${this.client.constants.emotes.error} ${context.__('google.error.noResult')}`);
    
    message.edit(context.__('google.result', {
      mention: `<@${context.message.member && context.message.member.nickname ? '!' : ''}${context.message.author.id}>`,
      link: data.items[0].link,
    }));
  }
}

module.exports = GoogleCommand;
