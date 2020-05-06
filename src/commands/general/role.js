const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class MembersSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'members',
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

    const members = role.members
      .sort((a, b) => a.user.tag.localeCompare(b.user.tag))
      .map((m) => `${message.dot} ${m.user.tag} (${m.id})`);
    if (!members.length) {
      message.info(message._('role.members.empty', role.name));
      return 0;
    }

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('role.members.title', role.name),
      null,
      members,
    );

    return 0;
  }
}

class RoleCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'role',
      children: [new MembersSubcommand(client, category)],
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
      `${message.dot} ${message._('role.position')}: #**${message.guild.roles.cache.size - role.rawPosition - 1}**`,
      `${message.dot} ${message._('role.memberCount')}: **${role.members.size}**`,
      `${message.dot} ${message._('role.managed')}: **${role.managed ? message._('global.yes') : message._('global.no')}**`,
      `${message.dot} ${message._('role.mentionable')}: **${role.mentionable ? message._('global.yes') : message._('global.no')}**`,
      `${message.dot} ${message._('role.hoisted')}: **${role.hoisted ? message._('global.yes') : message._('global.no')}**`,
      `${message.dot} ${message._('role.permissions')}: ${role.permissions.toArray().map((p) => `\`${p}\``).join(', ')}`,
      `${message.dot} ${message._('role.creation')}: ${message.getMoment(role.createdTimestamp)}`,
    ];

    const embed = new MessageEmbed()
      .setDescription(description.join('\n'))
      .setColor(role.hexColor);

    message.send(message._('role.title', role.name), embed);
    return 0;
  }
}

module.exports = RoleCommand;
