const Event = require('../structures/Event');

class TypingStartEvent extends Event {
  constructor(client) {
    super(client, 'typingStart');
  }

  handle(channel, user) {
    if (!this.client.ready) return;

    this.client.telephone.calls.handleTyping(channel, user);
    this.client.tracking.updateActivity(user.id);
  }
}

module.exports = TypingStartEvent;
