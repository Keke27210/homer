const Command = require('../../structures/Command');

class GameCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'activities',
      aliases: ['game'],
      dm: true,
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let { member } = message;
    let user = message.author;
    if (message.guild && search) {
      const found = await this.client.finderUtil.findMembers(message, search);
      if (!found.length) {
        message.error(message._('finder.members.zero', search));
        return 0;
      }
      if (found.length > 1) {
        message.warn(this.client.finderUtil.formatMembers(message, found, search));
        return 0;
      }
      [member] = found;
      user = member.user;
    }

    const activities = user.presence.activities.filter((a) => a.type !== 'CUSTOM_STATUS');
    if (!activities.length) {
      message.send(message._('activities.none', message.emote('activities'), user.tag));
      return 0;
    }

    const pages = [];
    const entries = [];

    activities
      .sort((a, b) => Number(a.assets) > Number(b.assets)
        || (a.timestamps ? a.timestamps.start : 0) - (b.timestamps ? b.timestamps.start : 0))
      .forEach((activity) => {
        pages.push({
          title: message._(`activities.type.${activity.type}`, activity.name),
          thumbnail: activity.assets ? activity.assets.largeImageURL({ size: 256 }) : undefined,
        });

        const description = [];
        if (activity.type === 'PLAYING') {
          description.push(`**${activity.name}**`);
          if (activity.details) description.push(activity.details);
          if (activity.state) description.push(activity.state);
          if (activity.timestamps) {
            if (activity.timestamps.start) description.push(message._('activities.elapsed', message.getDuration(activity.timestamps.start)));
            if (activity.timestamps.end) description.push(message._('activities.remaining', message.getDuration(activity.timestamps.end)));
          }
        } else if (activity.type === 'LISTENING') {
          description.push(
            `**${activity.details}**`,
            message._('activities.listening.artist', activity.state),
            message._('activities.listening.album', activity.assets.largeText),
          );
        } else if (activity.type === 'STREAMING') {
          description.push(message._('activities.streaming.link', activity.url));
        }

        entries.push(description.join('\n'));
      });

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('activities.title', message.emote('activities'), user.tag),
      pages,
      entries,
      { entriesPerPage: 1, footer: ' ' },
    );

    return 0;
  }
}

module.exports = GameCommand;
