const Event = require('../structures/Event');

class ChannelDeleteEvent extends Event {
  constructor(client) {
    super(client, 'channelDelete');
  }

  handle(channel) {
    if (!this.client.ready) return;

    this.client.telephone.contracts._channelDelete(channel.id);
  }
}

module.exports = ChannelDeleteEvent;
