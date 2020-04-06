const Event = require('../structures/Event');

class MessageReactionAdd extends Event {
  constructor(client) {
    super(client, 'messageReactionAdd');
  }

  handle(reaction, user) {
    this.client.menuUtil.handleReaction(reaction, user);
  }
}

module.exports = MessageReactionAdd;
