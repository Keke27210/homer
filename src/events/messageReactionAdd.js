const Event = require('../structures/Event');

class MessageReactionAdd extends Event {
  constructor(client) {
    super(client, 'messageReactionAdd');
  }

  handle(reaction, user) {
    if (!this.client.ready) return;

    this.client.menuUtil.handleReaction(reaction, user);
    this.client.tracking.updateActivity(user.id);
  }
}

module.exports = MessageReactionAdd;
