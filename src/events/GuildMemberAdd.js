const Event = require('../structures/Event');

class GuildMemberAddEvent extends Event {
  constructor(client) {
    super(client, 'guildMemberAdd');
  }

  async handle(member) {
    this.client.database.getDocument('settings', member.guild.id).then(async (settings) => {
      if (!settings) return;

      const channel = member.guild.channels.get(settings.welcome.channel);
      if (!channel || !settings.welcome.message) return;

      member.settings = settings;
      const parsed = await this.client.lisa.parseString(member, settings.welcome.message, 'memberlog');
      channel.send(parsed.content || '', parsed.embed);
    });
  }
}

module.exports = GuildMemberAddEvent;
