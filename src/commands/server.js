const Command = require('../structures/Command');

class ServerCommand extends Command {
  constructor(client) {
    super(client, {
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
    await this.client.users.fetch(guild.ownerID);

    const description = [
      `${message.dot} ${message._('server.id')}: **${guild.id}**`,
      `${message.dot} ${message._('server.owner')}: ${guild.owner.user.tag}`,
      `${message.dot} ${message._('server.region')}: ${this.region[guild.region]} **${message._(`server.regions.${guild.region}`)}**`,
      `${message.dot} ${message._('server.members')}: ${message._(
        'server.memberDesc',
        guild.memberCount,
        guild.members.cache.filter((m) => m.user.presence.status === 'online').size,
        guild.members.cache.filter((m) => m.user.bot).size,
        message.eOnline,
        message.eBot,
      )}`,
      `${message.dot} ${message._('server.creation')}: **${message.getMoment(guild.createdTimestamp)}**`,
    ];

    const embed = message.getEmbed()
      .setDescription(description.join('\n'))
      .setThumbnail(guild.iconURL({ size: 256 }));

    message.channel.send(message._('server.title', guild.name), embed);
  }
}

module.exports = ServerCommand;
