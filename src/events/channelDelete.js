const Event = require('../structures/Event');

class ChannelDeleteEvent extends Event {
  constructor(client) {
    super(client, 'channelDelete');
  }

  handle(channel) {
    this.client.telephone.contractManager.channelDeletion(channel.id);
  }
}

module.exports = ChannelDeleteEvent;
