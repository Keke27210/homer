const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class RolemeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roleme',
      botPermissions: ['MANAGE_ROLES'],
      usage: '<role>',
      children: [new ListSubcommand(client), new AddSubcommand(client), new RemoveSubcommand(client)],
      category: 'general',
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let role = null;
    if (search) {
      const foundRoles = this.client.finder.findRolesOrChannels(context.message.guild.roles, search);
      if (!foundRoles || foundRoles.length === 0) return context.replyError(context.__('finderUtil.findRoles.zeroResult', { search }));
      if (foundRoles.length === 1) role = foundRoles[0];
      else if (foundRoles.length > 1) return context.replyWarning(this.client.finder.formatRoles(foundRoles, context.settings.misc.locale));
    } else {
      return context.replyError(context.__('roleme.noQuery'));
    }

    if (!context.settings.rolemeRoles.includes(role.id)) {
      return context.replyError(context.__('roleme.unavailableRole', { name: role.name }));
    }

    if (context.message.guild.me.highestRole.position <= role.position) {
      return context.replyError(context.__('role.botCannotInteract', { name: role.name }));
    }

    if (context.message.member.roles.has(role.id)) {
      await context.message.member.removeRole(role.id, 'Roleme');
      context.replySuccess(context.__('roleme.removedRole', { name: role.name }));
    } else {
      await context.message.member.addRole(role.id, 'Roleme');
      context.replySuccess(context.__('roleme.addedRole', { name: role.name }));
    }
  }
}

class ListSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list',
      category: 'general',
    });
  }

  async execute(context) {
    if (context.settings.rolemeRoles.length === 0) {
      return context.replyError(context.__('roleme.list.noRole'));
    }

    const roleList = context.settings.rolemeRoles
      .map((roleID) => {
        const role = context.message.guild.roles.get(roleID);
        if (!role) {
          context.settings.rolemeRoles.splice(context.settings.rolemeRoles.indexOf(roleID), 1);
          context.saveSettings();
        }

        return `${this.dot} ${role ? `**${role.name}**` : `*${context.__('global.unknown')}*`} (ID:${roleID})`;
      })
      .join('\n');

    const embed = new RichEmbed()
      .setDescription(roleList);

    context.replySuccess(
      context.__('roleme.list.title', { name: context.message.guild.name }),
      { embed },
    );
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      category: 'general',
      usage: '<role>',
      userPermissions: ['MANAGE_ROLES'],
    });
  }

  async execute(context) {
    if (context.settings.rolemeRoles.length >= 10) return context.replyWarning(context.__('roleme.add.cannotAddMore'));

    const search = context.args.join(' ');
    let role = null;
    if (search) {
      const foundRoles = this.client.finder.findRolesOrChannels(context.message.guild.roles, search);
      if (!foundRoles || foundRoles.length === 0) return context.replyError(context.__('finderUtil.findRoles.zeroResult', { search }));
      if (foundRoles.length === 1) role = foundRoles[0];
      else if (foundRoles.length > 1) return context.replyWarning(this.client.finder.formatRoles(foundRoles, context.settings.misc.locale));
    } else {
      return context.replyError(context.__('roleme.noQuery'));
    }

    if (context.message.guild.me.highestRole.position <= role.position) {
      return context.replyError(context.__('role.botCannotInteract', { name: role.name }));
    }

    if (context.message.member.highestRole.position <= role.position) {
      return context.replyError(context.__('role.cannotInteract', { name: role.name }));
    }

    if (!context.settings.rolemeRoles.includes(role.id)) {
      context.settings.rolemeRoles.push(role.id);
      await context.saveSettings();
      context.replySuccess(context.__('roleme.add.done', { name: role.name }));
    } else {
      context.replyError(context.__('roleme.add.alreadyIn', { name: role.name }));
    }
  }
}

class RemoveSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      aliases: ['delete'],
      category: 'general',
      usage: '<role>',
      userPermissions: ['MANAGE_ROLES'],
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let role = null;
    if (search) {
      const foundRoles = this.client.finder.findRolesOrChannels(context.message.guild.roles, search);
      if (!foundRoles || foundRoles.length === 0) return context.replyError(context.__('finderUtil.findRoles.zeroResult', { search }));
      if (foundRoles.length === 1) role = foundRoles[0];
      else if (foundRoles.length > 1) return context.replyWarning(this.client.finder.formatRoles(foundRoles, context.settings.misc.locale));
    } else {
      return context.replyError(context.__('roleme.noQuery'));
    }

    if (context.message.member.highestRole.position <= role.position) {
      return context.replyError(context.__('role.cannotInteract', { name: role.name }));
    }

    if (context.settings.rolemeRoles.includes(role.id)) {
      context.settings.rolemeRoles.splice(context.settings.rolemeRoles.indexOf(role.id), 1);
      await context.saveSettings();
      context.replySuccess(context.__('roleme.remove.done', { name: role.name }));
    } else {
      context.replyError(context.__('roleme.remove.notFound', { name: role.name }));
    }
  }
}

module.exports = RolemeCommand;
