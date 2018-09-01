const Command = require('../../structures/Command');
const Menu = require('../../structures/Menu');
const { RichEmbed } = require('discord.js');

class ServerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'server',
      aliases: ['guild', 'serverinfo'],
      category: 'general',
      children: [new StaffSubcommand(client), new EmotesSubcommand(client)],
    });
  }

  async execute(context) {
    const guild = context.message.guild;
    const guildOwner = guild.owner ? guild.owner.user : await this.client.fetchUser(guild.ownerID);

    const channels = [
      `**${context.message.guild.channels.filter(c => c.type === 'text').size}** ${context.__('channel.type.text')}`,
      `**${context.message.guild.channels.filter(c => c.type === 'voice').size}** ${context.__('channel.type.voice')}`,
    ].join(', ');

    const region = guild.region.startsWith('vip-') ? guild.region.substring(4) : guild.region;

    let counts = {};
    let bots = 0;
    if (!guild.large) {
      guild.members.forEach((member) => {
        if (member.user.bot) bots += 1;
        if (!counts[member.user.presence.status]) counts[member.user.presence.status] = 0;
        counts[member.user.presence.status] += 1;
      });
    }

    const members = guild.large ? `**${guild.memberCount}**` : [
      `${this.client.constants.status.online} **${counts.online || 0}**`,
      `${this.client.constants.status.idle} **${counts.idle || 0}**`,
      `${this.client.constants.status.dnd} **${counts.dnd || 0}**`,
      `${this.client.constants.status.offline} **${counts.offline || 0}**`,
      `${this.client.constants.emotes.bot} **${bots}**`,
    ].join(' - ');

    const serverInformation = [
      `${this.dot} ${context.__('server.embed.id')}: **${guild.id}**${guild.verified ? ` ${this.client.constants.emotes.verifiedServer}` : ''}`,
      `${this.dot} ${context.__('server.embed.owner')}: **${guildOwner.username}**#${guildOwner.discriminator} (ID:${guild.ownerID})`,
      `${this.dot} ${context.__('server.embed.region')}: ${this.client.constants.regionFlags[region]} **${context.__(`server.region.${region}`)}${guild.region.startsWith('vip-') ? ' (VIP)' : ''}**`,
      `${this.dot} ${context.__('server.embed.channels')}: ${channels}`,
      `${this.dot} ${context.__('server.embed.members')}: ${members}`,
      `${this.dot} ${context.__('server.embed.verificationLevel')}: **${context.__(`server.verificationLevel.${guild.verificationLevel}`)}**`,
      `${this.dot} ${context.__('server.embed.explicitContentFilter')}: **${context.__(`server.explicitContentFilter.${guild.explicitContentFilter}`)}**`,
      `${this.dot} ${context.__('server.embed.mfaRequired')}: **${guild.mfaLevel === 1 ? context.__('global.yes') : context.__('global.no')}**`,
      `${this.dot} ${context.__('server.embed.defaultMessageNotifications')}: **${context.__(`server.defaultMessageNotifications.${guild.defaultMessageNotifications}`)}**`,
      `${this.dot} ${context.__('server.embed.creation')}: **${context.formatDate(guild.createdTimestamp)}**`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(serverInformation)
      .setThumbnail(guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}` : undefined)
      .setImage(guild.splash ? `https://cdn.discordapp.com/splashes/${invite.guild.id}/${invite.guild.splash}.png?size=512` : undefined);

    context.reply(
      context.__('server.title', {
        name: guild.name,
      }),
      { embed },
    );
  }

  getDefaultAvatar(discriminator) {
    const defaultAvatarID = discriminator % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarID}.png`;
  }
}

class StaffSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'staff',
      aliases: ['mods', 'admins'],
      category: 'general',
    });
  }

  async execute(context) {
    const staff = context.message.guild.members
      .filter(m =>
        !m.user.bot &&
        m.user.presence.status !== 'offline' &&
        (m.permissions.has('MANAGE_GUILD') || m.permissions.has('KICK_MEMBERS'))
      )
      .map(m => ({ username: m.user.username, discrim: m.user.discriminator, status: m.user.presence.status, type: (m.permissions.has('MANAGE_GUILD') ? 'admin' : 'mod') }))
      .sort((a, b) => {
        if (a.status === b.status) {
          if (a.type === b.type) return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
          return a.type.localeCompare(b.type);
        }
        return this.statusOrder[a.status].localeCompare(this.statusOrder[b.status]);
      });

    const embed = new RichEmbed()
      .setDescription(staff.map(m => `${this.client.constants.status[m.status]} **${m.username}**#${m.discrim} (\`${m.type.toUpperCase()}\`)`).join('\n'));

    context.reply(
      context.__('server.staff.title', { name: context.message.guild.name }),
      { embed },
    );
  }

  get statusOrder() {
    return ({
      'online': 'a',
      'idle': 'b',
      'dnd': 'c',
    });
  }
}

class EmotesSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'emotes',
      aliases: ['emojis'],
      category: 'general',
    });
  }

  async execute(context) {
    if (context.message.guild.emojis.size === 0) {
      return context.replyWarning(context.__('server.emotes.noEmote', { name: context.message.guild.name }));
    }

    const menu = new Menu(
      context,
      context.message.guild.emojis.map(e => `${e.toString()} **${e.name}** (ID:${e.id})`),
    );

    menu.send(`${this.client.constants.emotes.success} ${context.__('server.emotes.title', { name: context.message.guild.name })}`);
  }
}

module.exports = ServerCommand;
