const Event = require('../structures/Event');

class GuildDeleteEvent extends Event {
  constructor(client) {
    super(client, 'guildDelete');
  }

  handle(guild) {
    if (!this.client.ready) return;

    this.client.telephone.contracts._guildDelete(guild.id);
  }
}

module.exports = GuildDeleteEvent;
