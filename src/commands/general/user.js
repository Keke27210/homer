const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class UserCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'user',
      aliases: ['userinfo', 'info'],
      dm: true,
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let { member } = message;
    let user = message.author;
    if (message.guild && search) {
      const found = await this.client.finderUtil.findMembers(message, search);
      if (!found.length) {
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

    await user.fetchFlags();
    const flags = Object.entries(user.flags.serialize()).filter(([, v]) => v).map(([k]) => k);

    const honours = [];
    if (this.client.constants.owners.includes(user.id)) honours.push(message.emote('developer'));
    if (message.guild && message.guild.ownerID === user.id) honours.push(message.emote('owner'));
    if (await this.client.settings.isDonator(user.id)) honours.push(message.emote('donator'));
    if (user.system) honours.push(message.emote('VERIFIED_BOT'));
    for (let i = 0; i < flags.length; i += 1) honours.push(message.emote(flags[i]));
    if (user.avatar && user.avatar.startsWith('a_')) honours.push(message.emote('nitro'));
    if (user.boostingLevel > 0) honours.push(message.emote(`boosting_${user.boostingLevel}`));

    const description = [`${message.dot} ${message._('user.id')}: **${user.id}**${honours.length ? ` ${honours.join(' ')}` : ''}`];

    if (message.guild) {
      description.push(`${message.dot} ${message._('user.nickname')}: ${member.nickname ? `**${member.nickname}**` : message._('global.none')}`);
    }

    description.push(`${message.dot} ${message._('user.status')}: ${message.emote((user.presence.clientStatus && user.presence.clientStatus.mobile) === 'online' ? 'mobile' : user.presence.status)} **${message._(`user.statusDesc.${user.presence.status}`)}**`);

    if (user.presence.activities.length) {
      // Priority: Custom Status > Streaming > Playing > Listening > Watching
      const activity = user.presence.activities.find((a) => a.type === 'CUSTOM_STATUS' || a.type === 'STREAMING' || a.type === 'PLAYING' || a.type === 'LISTENING' || a.type === 'WATCHING');
      let emote;
      let detail;
      switch (activity.type) {
        case 'CUSTOM_STATUS':
          if (activity.emoji) {
            if (activity.emoji.id) {
              const emoji = this.client.emojis.resolve(activity.emoji.id);
              if (emoji) emote = emoji.toString();
              else emote = '';
            } else {
              emote = activity.emoji.name;
            }
          } else {
            emote = '';
          }
          detail = activity.state || '';
          break;
        case 'STREAMING':
          emote = '📡';
          detail = message._('user.activities.streaming', activity.name);
          break;
        case 'PLAYING':
          emote = '🎮';
          detail = message._('user.activities.playing', activity.name);
          break;
        case 'LISTENING':
          emote = '🎵';
          detail = activity.details
            ? message._('user.activities.listening', activity.details, activity.name)
            : message._('user.activities.listening2', activity.name);
          break;
        case 'WATCHING':
          emote = '📺';
          detail = message._('user.activities.watching', activity.name);
          break;
        default:
          emote = message.emote('placeholder');
      }
      description.push(`${message.dot} ${message._('user.activity')}: ${emote} ${detail}`);
    }

    if (message.guild) {
      const roles = member.roles.cache
        .filter((r) => r.id !== message.guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => r.toString())
        .join(', ');
      description.push(`${message.dot} ${message._('user.roles')}: ${roles || message._('global.none')}`);

      if (member.premiumSinceTimestamp) {
        description.push(`${message.dot} ${message._('user.boosting')}: ${message.emote('server_booster')} ${message._('user.boostingSince', message.getMoment(member.premiumSinceTimestamp))}`);
      }
    }

    const active = await this.client.tracking.getActivity(user.id);
    if (active) description.push(`${message.dot} ${message._('user.active')}: **${message.getDuration(active)}**`);

    description.push(`${message.dot} ${message._('user.creation')}: ${message.getMoment(user.createdTimestamp)}`);

    if (message.guild) {
      description.push(`${message.dot} ${message._('user.join')}: ${message.getMoment(member.joinedTimestamp)}`);
    }

    const embed = new MessageEmbed()
      .setDescription(description.join('\n'))
      .setThumbnail(user.avatarURL({ size: 256, dynamic: true }));
    if (member) embed.setColor(member.displayHexColor === '#000000' ? null : member.displayHexColor);

    message.channel.send(message._('user.title', user.bot ? message.emote('bot') : message.emote('human'), user.tag), embed);
    return 0;
  }
}

module.exports = UserCommand;
