const Command = require('../structures/Command');

class UserCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'user',
      aliases: ['userinfo'],
      dm: true,
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let { member } = message;
    let user = message.author;
    if (message.guild && search) {
      const found = await this.client.finderUtil.findMembers(message, search);
      if (found.length === 0) return message.error(message._('finder.members.zero', search));
      if (found.length > 1) return this.client.finderUtil.formatMembers(message, found, search);
      member = found[0];
      user = member.user;
    }

    const description = [
      `${message.dot} ${message._('user.id')}: **${user.id}**`,
      `${message.dot} ${message._('user.status')}: ${message.eStatus[user.presence.status]} **${message._(`user.statusDesc.${user.presence.status}`)}**`,
      `${message.dot} ${message._('user.creation')}: **${message.getMoment(user.createdTimestamp)}**`,
    ];

    const embed = message.getEmbed()
      .setDescription(description.join('\n'))
      .setThumbnail(user.avatarURL({ size: 256, dynamic: true }));
    if (member) embed.setColor(member.displayHexColor);

    return message.channel.send(message._('user.title', user.tag), embed);
  }
}

module.exports = UserCommand;
