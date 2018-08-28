const request = require('superagent');
const Command = require('../../structures/Command');

class YoutubeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'youtube',
      category: 'general',
      usage: '<search>',
      dm: true,
    });
  }

  async execute(context) {
    const search = encodeURIComponent(context.args.join(' '));
    if (!search) return context.replyError(context.__('youtube.noSearch'));
    if (search.length > 128) return context.replyWarning(context.__('youtube.searchTooLong'));

    request
      .get(`https://www.googleapis.com/youtube/v3/search?key=${this.client.config.api.youtube}&part=snippet&maxResults=1&q=${search}`)
      .then((response) => {
        const parsed = response.body;

        if (!parsed.items) return context.replyError(context.__('youtube.error'));
        if (parsed.pageInfo.totalResults === 0) return context.replyWarning(context.__('youtube.noResult'));

        let result;
        if (parsed.items[0].id.kind === 'youtube#channel') result = `📺 https://www.youtube.com/channel/${parsed.items[0].id.channelId}`;
        else if (parsed.items[0].id.kind === 'youtube#playlist') result = `📁 https://www.youtube.com/playlist?list=${parsed.items[0].id.playlistId}`;
        else if (parsed.items[0].id.kind === 'youtube#video') {
          if (parsed.items[0].snippet.liveBroadcastContent === 'live') result = `🔴 https://www.youtube.com/watch?v=${parsed.items[0].id.videoId}`;
          else result = `📹 https://www.youtube.com/watch?v=${parsed.items[0].id.videoId}`;
        }

        context.reply(result);
      })
      .catch(() => context.replyError(context.__('youtube.error')));
  }
}

module.exports = YoutubeCommand;
