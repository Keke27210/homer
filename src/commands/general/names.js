const Command = require('../../structures/Command');

function escapeMarkdown(text) {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*');
}

class NamesCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'names',
      dm: true,
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let { member } = message;
    let user = message.author;
    if (message.guild && search) {
      const found = await this.client.finderUtil.findMembers(message, search);
      if (!found) {
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

    const names = await this.client.tracking.getNames(user.id);
    if (!names.length) {
      message.info(message._('names.none', user.tag));
      return 0;
    }

    const entries = [`${message.dot} **${user.username}** - ${message._('names.current')}`];
    for (let i = (names.length - 1); i > 0; i -= 1) {
      const entry = names[i];
      entries.push(`${message.dot} **${escapeMarkdown(entry.name)}**${entry.time ? ` - ${message._('names.until')} **${message.getDuration(entry.time)}**` : ''}`);
    }

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('names.title', user.tag),
      null,
      entries,
      { footer: message._('names.footer') },
    );

    return 0;
  }
}

module.exports = NamesCommand;
