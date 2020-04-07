const Event = require('../structures/Event');

class TypingStartEvent extends Event {
  constructor(client) {
    super(client, 'typingStart');
  }

  handle(channel, user) {
    if (this.client.database.ready) {
      this.client.tracking.updateActivity(user.id);
    }

    if (user.id !== this.client.user.id) {
      this.client.telephone.calls.handleTyping(channel);
    }
  }
}

module.exports = TypingStartEvent;
