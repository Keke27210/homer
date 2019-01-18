const Command = require('../../structures/Command');

class YoutubeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'youtube',
      aliases: ['yt'],
      category: 'general',
      usage: '<search>',
      dm: true,
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    if (!search) return context.replyError(context.__('youtube.noSearch'));
    if (search.length > 128) return context.replyWarning(context.__('youtube.searchTooLong'));

    const data = await this.client.api.getYoutube(search);
    if (typeof data === 'number') return context.replyError(context.__('youtube.error'));

    if (!data.items) return context.replyError(context.__('youtube.error'));
    if (data.pageInfo.totalResults === 0) return context.replyWarning(context.__('youtube.noResult'));

    let result;
    if (data.items[0].id.kind === 'youtube#channel') result = `📺 https://www.youtube.com/channel/${data.items[0].id.channelId}`;
    else if (data.items[0].id.kind === 'youtube#playlist') result = `📁 https://www.youtube.com/playlist?list=${data.items[0].id.playlistId}`;
    else if (data.items[0].id.kind === 'youtube#video') {
      if (data.items[0].snippet.liveBroadcastContent === 'live') result = `🔴 https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
      else result = `📹 https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
    }

    context.reply(result);
  }
}

module.exports = YoutubeCommand;
