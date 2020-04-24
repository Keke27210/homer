const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { resolveInviteCode } = require('../../../node_modules/discord.js/src/util/DataResolver');
const { deconstruct } = require('../../../node_modules/discord.js/src/util/Snowflake');

const GIFT_URL = (id) => `https://discordapp.com/api/v6/entitlements/gift-codes/${encodeURIComponent(id)}`;

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
        const honours = [];
        if (invite.guild) {
          if (invite.guild.verified) honours.push(message.emote('verified'));
          if (invite.guild.features.includes('PARTNERED')) honours.push(message.emote('DISCORD_PARTNER'));
        }

        const description = [
          `${message.dot} ${message._('lookup.invite.inviter')}: ${invite.inviter ? `${invite.inviter.tag} (${invite.inviter.id})` : message._('global.none')}`,
          `${message.dot} ${message._('lookup.invite.channel')}: **${invite.channel.type === 'text' ? '#' : ''}${invite.channel.name}** (${invite.channel.id})`,
          `${message.dot} ${message._('lookup.invite.members')}: ${message._('lookup.invite.memberDesc', invite.memberCount, invite.presenceCount, message.emote('online', true))}`,
        ].join('\n');

        const guildDesc = [];
        if (invite.guild) {
          guildDesc.push(
            `${message.dot} ${message._('lookup.invite.guild.server')}: ${invite.guild ? `**${invite.guild.name}** (${invite.guild.id})${honours.length ? ` ${honours.join(' ')}` : ''}` : message._('global.unknown')}`,
            `${message.dot} ${message._('lookup.invite.guild.creation')}: ${invite.guild ? message.getMoment(invite.guild.createdTimestamp) : message._('global.unknown')}`,
          );
        }

        const embed = new MessageEmbed()
          .setDescription(description);
        if (guildDesc.length) embed.addField(message._('lookup.invite.guild.title'), guildDesc.join('\n'));
        if (invite.guild) embed.setThumbnail(invite.guild.iconURL({ size: 256, dynamic: true }));

        m.edit(message._('lookup.invite.title', invite.code), embed);
        return 0;
      }

      // 2- Gift code
      const gift = await fetch(GIFT_URL(search))
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (gift) {
        const description = [
          `${message.dot} ${message._('lookup.gift.name')}: **${gift.store_listing.sku.name}**`,
          `${message.dot} ${message._('lookup.gift.summary')}: **${gift.store_listing.summary}**`,
          `${message.dot} ${message._('lookup.gift.uses')}: **${gift.uses}**/**${gift.max_uses}** (**${message._(`lookup.gift.status.${(gift.uses >= gift.max_uses) ? 'redeemed' : 'available'}`)}**)`,
          `${message.dot} ${message._('lookup.gift.redeem')}: **[${gift.code}](https://discord.gift/${gift.code})**`,
        ];

        const embed = new MessageEmbed().setDescription(description.join('\n'));
        if (gift.expires_at) {
          embed
            .setFooter(message._('lookup.gift.expires'))
            .setTimestamp(new Date(gift.expires_at));
        }
        if (gift.store_listing.thumbnail) {
          embed.setThumbnail(`https://cdn.discordapp.com/app-assets/${gift.store_listing.sku.application_id}/store/${gift.store_listing.thumbnail.id}.png`);
        }

        m.edit(message._('lookup.gift.title', gift.code), embed);
        return 0;
      }

      // 5- Template
      const template = await this.client.api.guilds.templates(search).get()
        .catch(() => null);
      if (template) {
        const description = [
          `${message.dot} ${message._('lookup.template.name')}: **${template.name}**`,
          `${message.dot} ${message._('lookup.template.description')}: ${template.description ? `**${template.description}**` : message._('global.none')}`,
          `${message.dot} ${message._('lookup.template.creator')}: **${template.creator.username}**#${template.creator.discriminator} (${template.creator_id})`,
          `${message.dot} ${message._('lookup.template.usages')}: **${template.usage_count}**`,
          `${message.dot} ${message._('lookup.template.creation')}: ${message.getMoment(template.created_at)}`,
          `${message.dot} ${message._('lookup.template.use')}: **[${message._('lookup.template.uselink')}](https://discordapp.com/template/${template.code})**`,
        ].join('\n');

        const embed = new MessageEmbed()
          .setDescription(description)
          .setThumbnail(`https://cdn.discordapp.com/guilds/${template.source_guild_id}/${template.serialized_source_guild.icon_hash}.png`);
        if (template.updated_at) {
          embed.setFooter(message._('lookup.template.update'));
          embed.setTimestamp(new Date(template.updated_at));
        }

        m.edit(message._('lookup.template.title', message.emote('template'), template.code), embed);
        return 0;
      }
    } else {
      // 3- User ID
      const user = await this.client.users.fetch(search, { cache: false })
        .catch(() => null);
      if (user) {
        await user.fetchFlags();
        const flags = Object.entries(user.flags.serialize()).filter(([, v]) => v).map(([k]) => k);

        const honours = [];
        if (this.client.constants.owners.includes(user.id)) honours.push(message.emote('developer'));
        if (message.guild && message.guild.ownerID === user.id) honours.push(message.emote('owner'));
        if (await this.client.settings.isDonator(user.id)) honours.push(message.emote('donator'));
        if (user.system) honours.push(message.emote('VERIFIED_BOT'));
        for (let i = 0; i < flags.length; i += 1) honours.push(message.emote(flags[i]));
        if (user.avatar && user.avatar.startsWith('a_')) honours.push(message.emote('nitro'));

        const description = [`${message.dot} ${message._('lookup.user.id')}: **${user.id}**${honours.length ? ` ${honours.join(' ')}` : ''}`];

        const active = await this.client.tracking.getActivity(user.id);
        if (active) description.push(`${message.dot} ${message._('lookup.user.active')}: **${message.getDuration(active)}**`);

        description.push(`${message.dot} ${message._('lookup.user.creation')}: ${message.getMoment(user.createdTimestamp)}`);

        const embed = new MessageEmbed()
          .setDescription(description.join('\n'))
          .setThumbnail(user.displayAvatarURL({ size: 256, dynamic: true }));

        m.edit(message._('lookup.user.title', user.bot ? message.emote('bot') : message.emote('human'), user.tag), embed);
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
            partner: invite.guild ? invite.guild.features.includes('PARTNERED') : false,
            verified: invite.guild ? invite.guild.verified : false,
          }))
          .catch(() => null);

        const memberCount = {
          online: 0, idle: 0, dnd: 0,
        };
        for (let i = 0; i < guild.members.length; i += 1) {
          memberCount[guild.members[i].status] += 1;
        }

        const honours = [];
        if (meta) {
          if (meta.verified) honours.push(message.emote('verified'));
          if (meta.partner) honours.push(message.emote('DISCORD_PARTNER'));
        }

        const members = Object.keys(memberCount).map((status) => `${message.emote(status, true)} **${memberCount[status]}**`);
        if (meta && meta.memberCount) members.push(`${message.emote('offline', true)} **${meta.memberCount - guild.members.length}**`);

        const description = [
          `${message.dot} ${message._('lookup.server.id')}: **${guild.id}**${honours.length ? ` ${honours.join(' ')}` : ''}`,
          `${message.dot} ${message._('lookup.server.members')}: ${members.join(' - ')}`,
          `${message.dot} ${message._('lookup.server.channels')}: **${guild.channels.length}** ${message._('channel.types.voice')}`,
          `${message.dot} ${message._('lookup.server.invite')}: ${code ? `**[${code}](https://discord.gg/${resolveInviteCode(code)})**` : message._('global.none')}`,
          `${message.dot} ${message._('lookup.server.creation')}: ${message.getMoment(deconstruct(guild.id).timestamp)}`,
        ];

        const embed = new MessageEmbed()
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
