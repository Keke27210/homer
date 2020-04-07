const Event = require('../structures/Event');

class TypingStartEvent extends Event {
  constructor(client) {
    super(client, 'typingStart');
  }

  handle(_, user) {
    if (this.client.database.ready) {
      this.client.tracking.updateActivity(user.id);
    }
  }
}

module.exports = TypingStartEvent;
