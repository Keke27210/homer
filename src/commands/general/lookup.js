const { resolveInviteCode } = require('discord.js/src/util/DataResolver');
const { deconstruct } = require('discord.js/src/util/Snowflake');

const Command = require('../../structures/Command');

class LookupCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'lookup',
      dm: true,
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    if (!search) {
      message.error(message._('lookup.noSearch'));
      return 0;
    }

    const m = await message.loading(message._('lookup.looking'));

    if (Number.isNaN(Number(search))) {
      // 1- Invite code
      const invite = await this.client.fetchInvite(search)
        .catch(() => null);
      if (invite) {
        const description = [
          `${message.dot} ${message._('lookup.invite.server')}: ${invite.guild ? `**${invite.guild.name}** (${invite.guild.id})` : message._('global.unknown')}`,
          `${message.dot} ${message._('lookup.invite.inviter')}: ${invite.inviter ? invite.inviter.tag : message._('global.none')}`,
          `${message.dot} ${message._('lookup.invite.channel')}: **${invite.channel.type === 'text' ? '#' : ''}${invite.channel.name}** (${invite.channel.id})`,
          `${message.dot} ${message._('lookup.invite.members')}: ${message._('lookup.invite.memberDesc', invite.memberCount, invite.presenceCount, message.eStatus.online)}`,
          `${message.dot} ${message._('lookup.invite.creation')}: ${invite.guild ? message.getMoment(invite.guild.createdTimestamp) : message._('global.unknown')}`,
        ];

        const embed = message.getEmbed().setDescription(description.join('\n'));
        if (invite.guild) embed.setThumbnail(invite.guild.iconURL({ size: 256, dynamic: true }));

        m.edit(message._('lookup.invite.title', invite.code), embed);
        return 0;
      }

      // 2- Gift code
      // TBD
    } else {
      // 3- User ID
      const user = await this.client.users.fetch(search, { cache: false })
        .catch(() => null);
      if (user) {
        const description = [
          `${message.dot} ${message._('lookup.user.id')}: **${user.id}**`,
          `${message.dot} ${message._('lookup.user.creation')}: ${message.getMoment(user.createdTimestamp)}`,
        ];

        const embed = message.getEmbed()
          .setDescription(description.join('\n'))
          .setThumbnail(user.displayAvatarURL({ size: 256, dynamic: true }));

        m.edit(message._('lookup.user.title', user.bot ? message.eBot : '👤', user.tag), embed);
        return 0;
      }

      // 4- Server ID
      const guild = await this.client.api
        .guilds(search)['widget.json']
        .get()
        .catch((error) => (error.code === 50004 ? error.code : null));
      if (guild) {
        if (guild === 50004) {
          m.editWarn(message._('lookup.server.widgetDisabled', search));
          return 0;
        }

        // Fetching additional metadata if possible
        const code = resolveInviteCode(guild.instant_invite);
        const meta = await this.client.fetchInvite(code)
          .then((invite) => ({
            icon: invite.guild ? invite.guild.iconURL({ size: 256, dynamic: true }) : null,
            memberCount: invite.memberCount,
          }))
          .catch(() => null);

        const memberCount = {
          online: 0, idle: 0, dnd: 0,
        };
        for (let i = 0; i < guild.members.length; i += 1) {
          memberCount[guild.members[i].status] += 1;
        }

        const members = Object.keys(memberCount).map((status) => `${message.eStatus[status]} **${memberCount[status]}**`);
        if (meta && meta.memberCount) members.push(`${message.eStatus.offline} **${meta.memberCount - guild.members.length}**`);

        const description = [
          `${message.dot} ${message._('lookup.server.id')}: **${guild.id}**`,
          `${message.dot} ${message._('lookup.server.members')}: ${members.join(' - ')}`,
          `${message.dot} ${message._('lookup.server.channels')}: **${guild.channels.length}** ${message._('channel.types.voice')}`,
          `${message.dot} ${message._('lookup.server.invite')}: ${code ? `**[${code}](https://discord.gg/${resolveInviteCode(code)})**` : message._('global.none')}`,
          `${message.dot} ${message._('lookup.server.creation')}: ${message.getMoment(deconstruct(guild.id).timestamp)}`,
        ];

        const embed = message.getEmbed()
          .setDescription(description.join('\n'))
          .setThumbnail(meta ? meta.icon : undefined);

        m.edit(message._('lookup.server.title', guild.name), embed);
        return 0;
      }
    }

    m.editError(message._('lookup.noResults', search));
    return 0;
  }
}

module.exports = LookupCommand;
