const Command = require('../structures/Command');

class UserCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'user',
      aliases: ['userinfo'],
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let { member } = message;
    let user = message.author;
    if (search) {
      this.find();
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

    message.channel.send(message._('user.title', user.tag), embed);
  }
}

module.exports = UserCommand;
