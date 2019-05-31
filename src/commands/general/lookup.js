const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const { deconstruct } = require('../../../node_modules/discord.js/src/util/Snowflake');

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
          .setThumbnail(user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}`
            : this.getDefaultAvatar(user.discriminator));

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
    await this.client.rest.makeRequest('get', `/guilds/${search}/widget.json`, true)
      .then(async (guildObject) => {
        done = true;
        const { timestamp } = deconstruct(guildObject.id);

        const inviteCode = this.client.resolver.resolveInviteCode(guildObject.instant_invite) || null;
        const metadata = await this.client.rest.makeRequest('get', `/invites/${inviteCode}?with_counts=true`, true)
          .then(i => ({
            icon: `https://cdn.discordapp.com/icons/${guildObject.id}/${i.guild.icon}.png`,
            memberCount: i.approximate_member_count,
            verified: i.guild.features.includes('VERIFIED'),
            partnered: i.guild.features.includes('PARTNERED'),
          }))
          .catch(() => {
            const guild = this.client.guilds.get(guildObject.id);
            if (!guild) return ({});

            return ({
              icon: `https://cdn.discordapp.com/icons/${guildObject.id}/${guild.icon}.png`,
              memberCount: guild.memberCount,
              verified: guild.features.includes('VERIFIED'),
              partnered: guild.features.includes('PARTNERED'),
            });
          });

        let counts = {};
        for (let i = 0; i < guildObject.members.length; i += 1) {
          const status = guildObject.members[i].status;
          if (!counts[status]) counts[status] = 0;
          counts[status] += 1;
        }

        const members = [
          `${this.client.constants.status.online} **${counts.online || 0}**`,
          `${this.client.constants.status.idle} **${counts.idle || 0}**`,
          `${this.client.constants.status.dnd} **${counts.dnd || 0}**`,
        ];

        if (metadata.memberCount) members.push(`${this.client.constants.status.offline} **${metadata.memberCount - guildObject.members.length}**`);

        const guildInformation = [
          `${this.dot} ${context.__('server.embed.id')}: **${guildObject.id}**${metadata.verified ? ` ${this.client.constants.emotes.verified}` : ''}${metadata.partnered ? ` ${this.client.constants.emotes.partner}` : ''}`,
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
      .catch((error) => {
        if (error.code === 50004) {
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

        const guildObject = await this.client.rest.makeRequest('get', `/guilds/${invite.guild.id}/widget.json`, true)
          .then((res) => {
            const count = { offline: (invite.approximate_member_count - res.members.length) };
            for (let i = 0; i < res.members.length; i += 1) {
              const status = res.members[i].status;
              if (!count[status]) count[status] = 0;
              count[status] += 1;
            }
            return count;
          })
          .catch(() => ({}));

        const members = guildObject.online ? [
          `${this.client.constants.status.online} **${guildObject.online || 0}**`,
          `${this.client.constants.status.idle} **${guildObject.idle || 0}**`,
          `${this.client.constants.status.dnd} **${guildObject.dnd || 0}**`,
          `${this.client.constants.status.offline} **${guildObject.offline || 0}**`,
        ] : null;

        const inviteInformation = [
          `${this.dot} ${context.__('lookup.invite.embed.server')}: ${invite.guild ? `**${invite.guild.name}** (ID:${invite.guild.id})` : context.__('global.none')}${invite.guild.features.includes('VERIFIED') ? ` ${this.client.constants.emotes.verified}` : ''}${invite.guild.features.includes('PARTNERED') ? ` ${this.client.constants.emotes.partner}` : ''}`,
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
      .catch(() => {
        done = false;
      });

    if (done) return;

    // Gift
    await this.client.rest.makeRequest('get', `/entitlements/gift-codes/${this.client.other.resolveGiftCode(search)}`, true)
      .then((gift) => {
        done = true;

        const usable = (gift.uses < gift.max_uses);
        const giftInformation = [
          `${this.dot} ${context.__('lookup.gift.product')}: ${gift.store_listing.sku ? `**${gift.store_listing.sku.name}**` : context.__('global.unknown')} (${context.__(`lookup.gift.type.${gift.store_listing.sku ? gift.store_listing.sku.type : '-1'}`)})`,
          `${this.dot} ${context.__('lookup.gift.summary')}: **${gift.store_listing.summary}**`,
          `${this.dot} ${context.__('lookup.gift.from')}: **${gift.user.username}**#${gift.user.discriminator} (ID:${gift.user.id})`,
          `${this.dot} ${context.__('lookup.gift.status')}: **${context.__(`lookup.gift.usable.${usable ? 'yes' : 'no'}`)}** (**${gift.uses}**/**${gift.max_uses}**)`,
          `${this.dot} ${context.__('lookup.gift.reedem')}: **[${gift.code}](https://discord.gift/${gift.code})**`,
        ].join('\n');

        const embed = new RichEmbed()
          .setDescription(giftInformation)
          .setFooter(context.__('lookup.gift.expires'))
          .setTimestamp(new Date(gift.expires_at));
        if (gift.store_listing.sku && gift.store_listing.thumbnail) embed.setThumbnail(`https://cdn.discordapp.com/app-assets/${gift.store_listing.sku.application_id}/store/${gift.store_listing.thumbnail.id}.png`);

        message.edit(
          context.__('lookup.gift.main', { code: gift.code }),
          { embed },
        );
      })
      .catch(() => {
        done = false;
      });

    if (!done) {
      message.edit(`${this.client.constants.emotes.error} ${context.__('lookup.nothingFound', { search })}`);
    }
  }

  getDefaultAvatar(discriminator) {
    const defaultAvatarID = discriminator % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarID}.png`;
  }
}

module.exports = LookupCommand;
