const Command = require('../../structures/Command');

class RoleCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'role',
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    if (!search) {
      message.error(message._('role.noSearch'));
      return 0;
    }

    let role;
    if (search) {
      const found = this.client.finderUtil.findRoles(message, search);
      if (!found) {
        message.error(message._('finder.roles.zero', search));
        return 0;
      }
      if (found.length > 1) {
        message.warn(this.client.finderUtil.formatRoles(message, found, search));
        return 0;
      }
      [role] = found;
    }

    const description = [
      `${message.dot} ${message._('role.id')}: **${role.id}**`,
      `${message.dot} ${message._('role.color')}: **${role.hexColor.toUpperCase()}**`,
      `${message.dot} ${message._('role.position')}: #**${role.position}**`,
      `${message.dot} ${message._('role.memberCount')}: **${role.members.size}**`,
      `${message.dot} ${message._('role.managed')}: **${role.managed ? message._('global.yes') : message._('global.no')}**`,
      `${message.dot} ${message._('role.mentionable')}: **${role.mentionable ? message._('global.yes') : message._('global.no')}**`,
      `${message.dot} ${message._('role.hoisted')}: **${role.hoisted ? message._('global.yes') : message._('global.no')}**`,
      `${message.dot} ${message._('role.permissions')}: ${role.permissions.toArray().map((p) => `\`${p}\``).join(', ')}`,
      `${message.dot} ${message._('role.creation')}: ${message.getMoment(role.createdTimestamp)}`,
    ];

    const embed = message.getEmbed()
      .setDescription(description.join('\n'))
      .setColor(role.hexColor);

    message.send(message._('role.title', role.name), embed);
    return 0;
  }
}

module.exports = RoleCommand;
