const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class ServerCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'server',
      aliases: ['guild', 'serverinfo'],
    });

    /**
     * Emotes for voice regions
     * @type {string}
     */
    this.region = {
      amsterdam: ':flag_nl:',
      brazil: ':flag_br:',
      dubai: ':flag_sa:',
      europe: ':flag_eu:',
      'eu-central': ':flag_eu',
      'eu-east': ':flag_eu:',
      'eu-west': ':flag_eu:',
      frankfurt: ':flag_de:',
      hongkong: ':flag_hk:',
      india: ':flag_in:',
      japan: ':flag_ja:',
      london: ':flag_gb:',
      russia: ':flag_ru:',
      singapore: ':flag_sg:',
      southafrica: ':flag_za:',
      sydney: ':flag_au:',
      'us-central': ':flag_us:',
      'us-east': ':flag_us:',
      'us-south': ':flag_us:',
      'us-west': ':flag_us:',
    };
  }

  async main(message) {
    const { guild } = message;
    const {
      approximate_member_count: approximateMemberCount,
      approximate_presence_count: approximatePresenceCount,
    } = await this.client.api.guilds(guild.id).get({ query: { with_counts: true } });
    await this.client.users.fetch(guild.ownerID);

    const honours = [];
    if (guild.verified) honours.push(message.emote('verified'));
    if (guild.features.includes('PARTNERED')) honours.push(message.emote('partnered'));

    const description = [
      `${message.dot} ${message._('server.id')}: **${guild.id}**${honours.length ? ` ${honours.join(' ')}` : ''}`,
      `${message.dot} ${message._('server.owner')}: ${guild.owner.user.tag} (${guild.ownerID})`,
      `${message.dot} ${message._('server.region')}: ${this.region[guild.region]} **${message._(`server.regions.${guild.region}`)}**`,
      `${message.dot} ${message._('server.boost')}: ${guild.premiumTier === 0 ? message._('global.none') : `${message.emote(`tier_${guild.premiumTier}`)} **${message._('server.boosts.level', guild.premiumTier)}** (${message._('server.boosts.count', guild.premiumSubscriptionCount)})`}`,
      `${message.dot} ${message._('server.members')}: ${message._('server.memberDesc', [message.emote('online'), message.emote('offline')], [approximatePresenceCount, approximateMemberCount])}`,
      `${message.dot} ${message._('server.channels')}: ${['category', 'text', 'voice'].map((t) => `**${guild.channels.cache.filter((c) => c.type === t).size}** ${message._(`server.channel.${t}`)}`).join(', ')}`,
      `${message.dot} ${message._('server.creation')}: ${message.getMoment(guild.createdTimestamp)}`,
    ];

    const embed = new MessageEmbed()
      .setDescription(description.join('\n'))
      .setThumbnail(guild.iconURL({ size: 256 }));

    message.send(message._('server.title', guild.name, guild.features.includes('PUBLIC')), embed);
    return 0;
  }
}

module.exports = ServerCommand;
