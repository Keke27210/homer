const Command = require('../../structures/Command');

class ServicetelCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'servicetel',
      dm: true,
      private: true,
    });
  }

  async main(message, args) {
    let [id] = args;
    if (!id) {
      message.error(message._('servicetel.noID'));
      return 0;
    }

    id = parseInt(id, 10);
    if (Number.isNaN(id)) {
      message.error(message._('servicetel.invalid'));
      return 0;
    }

    const contract = await this.client.telephone.contracts.getRow(id);
    if (!contract) {
      message.warn(message._('servicetel.unknown', id));
      return 0;
    }

    const subscriber = await this.client.users.fetch(contract.subscriber)
      .catch(() => null);
    await subscriber.fetchFlags();

    const pages = [];
    const entries = [];

    // Contract information
    pages.push({ title: message._('servicetel.contract', contract.context === contract.subscriber ? 'DM' : 'Guild') });
    entries.push([
      `${message.dot} ${message._('telephone.contract.id')}: \`${contract.id}\``,
      `${message.dot} ${message._('telephone.contract.number')}: **${contract.number || message._('telephone.contract.noNumber')}**`,
      `${message.dot} ${message._('telephone.contract.subscriber')}: ${subscriber ? subscriber.tag : 'Unknown'}`,
      `${message.dot} ${message._('telephone.contract.state')}: **${message._(`telephone.states.${contract.state}`)}**`,
      `${message.dot} ${message._('telephone.contract.textable')}: **${message._(`global.${contract.textable ? 'yes' : 'no'}`)}**`,
      `${message.dot} ${message._('telephone.contract.date')}: ${message.getMoment(contract.created.getTime())}`,
    ]);

    // Guild information if any
    const guild = await this.client.guilds.resolve(contract.context)
      .catch(() => null);
    if (guild) {
      pages.push({ title: message._('servicetel.guild') });

      const honours = [];
      if (guild.verified) honours.push(message.emote('verified'));
      if (guild.features.includes('PARTNERED')) honours.push(message.emote('DISCORD_PARTNER'));

      entries.push([
        `${message.dot} ${message._('server.id')}: **${guild.id}**${honours.length ? ` ${honours.join(' ')}` : ''}`,
        `${message.dot} ${message._('server.owner')}: ${guild.owner.user.tag} (${guild.ownerID})`,
        `${message.dot} ${message._('server.region')}: ${this.region[guild.region]} **${message._(`server.regions.${guild.region}`)}**`,
        `${message.dot} ${message._('server.members')}: ${message._(
          'server.memberDesc',
          guild.memberCount,
          guild.members.cache.filter((m) => m.user.presence.status === 'online').size,
          guild.members.cache.filter((m) => m.user.bot).size,
          message.emote('online', true),
          message.emote('bot'),
        )}`,
        `${message.dot} ${message._('server.channels')}: ${['category', 'text', 'voice'].map((t) => `**${guild.channels.cache.filter((c) => c.type === t).size}** ${message._(`server.channel.${t}`)}`).join(', ')}`,
        `${message.dot} ${message._('server.creation')}: ${message.getMoment(guild.createdTimestamp)}`,
      ]);
    }

    // Subscriber information
    pages.push({ title: message._('servicetel.subscriber') });
    const flags = Object.entries(subscriber.flags.serialize()).filter(([, v]) => v).map(([k]) => k);
    const honours = [];
    if (this.client.owners.includes(subscriber.id)) honours.push(message.emote('developer'));
    if (message.guild && message.guild.ownerID === subscriber.id) honours.push(message.emote('owner'));
    if (await this.client.settings.isDonator(subscriber.id)) honours.push(message.emote('donator'));
    if (subscriber.system) honours.push(message.emote('VERIFIED_BOT'));
    for (let i = 0; i < flags.length; i += 1) honours.push(message.emote(flags[i]));
    if (subscriber.avatar && subscriber.avatar.startsWith('a_')) honours.push(message.emote('nitro'));

    const description = [
      `${message.dot} ${message._('user.id')}: **${subscriber.id}**${honours.length ? ` ${honours.join(' ')}` : ''}`,
      `${message.dot} ${message._('user.status')}: ${message.emote(subscriber.presence.status, true)} **${message._(`user.statusDesc.${subscriber.presence.status}`)}**`,
    ];

    if (subscriber.presence.activities.length) {
      // Priority: Custom Status > Streaming > Playing > Listening > Watching
      const activity = subscriber.presence.activities.find((a) => a.type === 'CUSTOM_STATUS' || a.type === 'STREAMING' || a.type === 'PLAYING' || a.type === 'LISTENING' || a.type === 'WATCHING');
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
          detail = activity.state;
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
          detail = message._('user.activities.listening', activity.details, activity.name);
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

    const active = await this.client.tracking.getActivity(subscriber.id);
    if (active) description.push(`${message.dot} ${message._('user.active')}: **${message.getDuration(active)}**`);

    description.push(`${message.dot} ${message._('user.creation')}: ${message.getMoment(subscriber.createdTimestamp)}`);

    // Blacklist
    pages.push({ title: message._('servicetel.blacklist') });
    entries.push(contract.blacklist.map((b) => `\`${b}\``).join(' - '));

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('servicetel.title', contract.id),
      pages,
      entries,
      { entriesPerPage: 1 },
    );
    return 0;
  }
}

module.exports = ServicetelCommand;
