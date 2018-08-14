const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const { deconstruct } = require('../../../node_modules/discord.js/src/util/Snowflake');
const snekfetch = require('snekfetch');

class LookupCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'lookup',
      category: 'general',
      usage: '<ID/invite>',
      dm: true,
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    if (!search) return context.replyError(context.__('lookup.noSearch'));
    const message = await context.replyLoading(context.__('global.loading'));
    const embed = new RichEmbed();
    let done = false;

    // User
    await this.client.fetchUser(search)
      .then(async (user) => {
        done = true;

        const badges = (await this.client.other.getBadges(user.id));

        const lastactive = await this.client.database.getDocument('lastactive', user.id)
          .then((lastactiveObject) => {
            if (!lastactiveObject) return context.__('global.noInformation');
            return this.client.time.timeSince(lastactiveObject.time, context.settings.misc.locale, false, true);
          });

        const userInformation = [
          `${this.dot} ${context.__('user.embed.id')}: **${user.id}**${badges ? ` ${badges}` : ''}`,
          `${this.dot} ${context.__('user.embed.lastactive')}: ${lastactive}`,
          `${this.dot} ${context.__('user.embed.creation')}: **${context.formatDate(user.createdTimestamp)}**`,
        ].join('\n');

        embed
          .setDescription(userInformation)
          .setThumbnail(user.displayAvatarURL);

        message.edit(
          context.__('user.title', {
            emote: (user.bot ? this.client.constants.emotes.bot : '👤'),
            name: `**${user.username}**#${user.discriminator}`,
          }),
          { embed },
        );
      })
      .catch(() => {
        done = false;
      });

    if (done) return;

    // Guild
    await snekfetch
      .get(`https://discordapp.com/api/guilds/${search}/widget.json`)
      .set({ 'User-Agent': this.client.constants.userAgent() })
      .then(async (res) => {
        done = true;

        const guildObject = res.body;
        const { timestamp } = deconstruct(guildObject.id);

        const inviteCode = this.client.resolver.resolveInviteCode(guildObject.instant_invite) || null;
        const metadata = await this.client.fetchInvite(guildObject.instant_invite)
          .then(i => ({
            icon: `https://cdn.discordapp.com/icons/${guildObject.id}/${i.guild.icon}`,
            memberCount: i.memberCount,
          }))
          .catch(() => ({}));

        const members = [
          `${this.client.constants.status.online} **${guildObject.members.filter(m => m.status === 'online').length}**`,
          `${this.client.constants.status.idle} **${guildObject.members.filter(m => m.status === 'idle').length}**`,
          `${this.client.constants.status.dnd} **${guildObject.members.filter(m => m.status === 'dnd').length}**`,
        ];

        if (metadata.memberCount) members.push(`${this.client.constants.status.offline} **${metadata.memberCount - guildObject.members.length}**`);

        const guildInformation = [
          `${this.dot} ${context.__('server.embed.id')}: **${guildObject.id}**`,
          `${this.dot} ${context.__('server.embed.members')}: ${members.join(' - ')}`,
          `${this.dot} ${context.__('server.embed.channels')}: **${guildObject.channels.length}** ${context.__('channel.type.voice')}`,
          `${this.dot} ${context.__('server.embed.invite')}: ${inviteCode ? `**[${inviteCode}](https://discord.gg/${inviteCode})**` : context.__('global.none')}`,
          `${this.dot} ${context.__('server.embed.creation')}: **${context.formatDate(timestamp)}**`,
        ].join('\n');

        embed
          .setDescription(guildInformation)
          .setThumbnail(metadata.icon);

        message.edit(
          context.__('server.title', { name: guildObject.name }),
          { embed },
        );
      })
      .catch((res) => {
        if (res.body && res.body.code === 50004) {
          done = true;
          message.edit(`${this.client.constants.emotes.warning} ${context.__('lookup.disabledWidget', { search })}`);
        } else {
          done = false;
        }
      });

    if (done) return;

    // Invite
    await this.client.rest.makeRequest('get', `/invites/${this.client.resolver.resolveInviteCode(search)}?with_counts=true`, true)
      .then(async (invite) => {
        done = true;

        const inviter = invite.inviter
          ? `**${invite.inviter.username}**#${invite.inviter.discriminator} (ID:${invite.inviter.id})`
          : context.__('global.none');

        const guildObject = await snekfetch
          .get(`https://discordapp.com/api/guilds/${invite.guild.id}/widget.json`)
          .set({ 'User-Agent': this.client.constants.userAgent() })
          .then(res => ({
            online: res.body.members.filter(m => m.status === 'online').length,
            idle: res.body.members.filter(m => m.status === 'idle').length,
            dnd: res.body.members.filter(m => m.status === 'dnd').length,
            offline: invite.approximate_member_count - res.body.members.length,
          }))
          .catch(r => r.body ? ({}) : undefined);

        const members = guildObject.online ? [
          `${this.client.constants.status.online} **${guildObject.online}**`,
          `${this.client.constants.status.idle} **${guildObject.idle}**`,
          `${this.client.constants.status.dnd} **${guildObject.dnd}**`,
          `${this.client.constants.status.offline} **${guildObject.offline}**`,
        ] : null;

        const inviteInformation = [
          `${this.dot} ${context.__('lookup.invite.embed.server')}: ${invite.guild ? `**${invite.guild.name}** (ID:${invite.guild.id})` : context.__('global.none')}${invite.guild.features.includes('VERIFIED') ? ` ${this.client.constants.emotes.verifiedServer}` : ''}`,
          `${this.dot} ${context.__('lookup.invite.embed.inviter')}: ${inviter}`,
          `${this.dot} ${context.__('lookup.invite.embed.channel')}: **${invite.channel.name ? `#${invite.channel.name}` : context.__('global.groupDm')}** (ID:${invite.channel.id})`,
          `${this.dot} ${context.__('lookup.invite.embed.members')}: ${members ? members.join(' - ') : `**${invite.approximate_member_count}**${invite.approximate_presence_count ? ` (${this.client.constants.status.online} **${invite.approximate_presence_count}**)` : ''}`}`,
        ];

        if (invite.guild) {
          if (invite.guild.icon) embed.setThumbnail(`https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.png`);
          if (invite.guild.splash) inviteInformation.push(`${this.dot} ${context.__('lookup.invite.embed.splash')}: **[${context.__('global.image')}](https://cdn.discordapp.com/splashes/${invite.guild.id}/${invite.guild.splash}.png?size=512)**`);
          inviteInformation.push(`${this.dot} ${context.__('server.embed.creation')}: **${context.formatDate(deconstruct(invite.guild.id).timestamp)}**`);
        }

        inviteInformation.push(`${this.dot} ${context.__('lookup.invite.embed.quickAccess')}: **[${invite.code}](https://discord.gg/${invite.code})**`);
        embed.setDescription(inviteInformation.join('\n'));
        message.edit(
          context.__('lookup.invite.title', { invite: invite.code }),
          { embed },
        );
      })
      .catch((e) => {
        done = false;
      });

    if (!done) {
      message.edit(`${this.client.constants.emotes.error} ${context.__('lookup.nothingFound', { search })}`);
    }
  }
}

module.exports = LookupCommand;
