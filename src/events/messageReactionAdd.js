const Event = require('../structures/Event');

class MessageReactionAdd extends Event {
  constructor(client) {
    super(client, 'messageReactionAdd');
  }

  handle(reaction, user) {
    if (!this.client.ready) return;

    if (this.client.database.ready) {
      this.client.tracking.updateActivity(user.id);
    }

    this.client.menuUtil.handleReaction(reaction, user);
  }
}

module.exports = MessageReactionAdd;
