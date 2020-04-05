const Event = require('../structures/Event');

class GuildDeleteEvent extends Event {
  constructor(client) {
    super(client, 'guildDelete');
  }

  handle(guild) {
    this.client.telephone.contractManager.guildDeletion(guild.id);
  }
}

module.exports = GuildDeleteEvent;
