const Event = require('../structures/Event');

class UserUpdateEvent extends Event {
  constructor(client) {
    super(client, 'userUpdate');
  }

  handle(oldUser, newUser) {
    if (!this.client.ready) return;

    if (this.client.database.ready) {
      if (oldUser.username !== newUser.username) {
        this.client.tracking.updateNames(newUser.id, oldUser.username);
      } else this.client.tracking.updateActivity(newUser.id);
    }
  }
}

module.exports = UserUpdateEvent;
