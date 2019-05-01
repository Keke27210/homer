const Command = require('../../structures/Command');
const request = require('superagent');

class PornhubCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pornhub',
      usage: '<search>',
      category: 'porn',
      dm: true,
    });
  }

  async execute(context) {
    if (context.message.guild && !context.message.channel.nsfw) return context.replyError(context.__('porn.nonNsfw'));
    if (!context.settings.ageVerification) {
      const age = await this.client.other.ageVerification(context);
      if (!age) return; // Timeout or ❌ => Stop here
    }

    const search = context.args.join(' ');
    if (!search) return context.replyError(context.__('porn.noSearch'));
    if (search.length > 128) return context.replyError(context.__('porn.searchTooLong'));

    const message = await context.replyLoading(context.__('global.loading'));
    const data = await request
      .get(`http://www.pornhub.com/webmasters/search?query=${encodeURIComponent(search)}`)
      .then(r => r.body.videos)
      .catch(() => null);
    if (!data) return message.edit(`${this.client.constants.emotes.warning} ${context.__('porn.fetchError')}`);
    if (data.length === 0) return message.edit(`${this.client.constants.emotes.warning} ${context.__('porn.noResult', { search })}`);

    message.edit(context.__('pornhub.title', {
      emote: this.client.constants.emotes.pornhub,
      title: data[0].title,
      url: data[0].url,
    }));
  }
}

module.exports = PornhubCommand;
