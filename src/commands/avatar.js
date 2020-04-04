const Command = require('../structures/Command');

class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
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

    const embed = message.getEmbed().setImage(user.displayAvatarURL({ size: 512, dynamic: true }));
    if (message.guild) embed.setColor(member.displayHexColor);

    message.send(message._('avatar.title', user.tag), embed);
    return 0;
  }
}

module.exports = AvatarCommand;
