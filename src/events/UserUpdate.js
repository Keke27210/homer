const Event = require('../structures/Event');

class UserUpdateEvent extends Event {
  constructor(client) {
    super(client, 'userUpdate');
  }

  async handle(oldUser, newUser) {
    if (!oldUser || !newUser) return;

    // Update names
    if (oldUser.username !== newUser.username) {
      const namesObject = await this.client.database.getDocument('names', newUser.id) || ({
        id: newUser.id,
        names: [],
      });

      namesObject.names.push({ name: oldUser.username, time: Date.now() });
      this.client.database.insertDocument('names', namesObject, { conflict: 'update' });
    }
  }
}

module.exports = UserUpdateEvent;
