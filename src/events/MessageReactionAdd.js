const Event = require('../structures/Event');

class MessageReactionAddEvent extends Event {
  constructor(client) {
    super(client, 'messageReactionAdd');
  }

  handle(reaction, user) {
    const instance = this.client.menu.instances.find(i => i.message === reaction.message.id);
    if (instance) {
      if (user.id !== instance.author) return;
      this.client.menu.handleReaction(reaction, user);

      // Trying to delete the reaction
      const message = reaction.message;
      if (!message.guild || !message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) return;
      reaction.remove();
    }
  }
}

module.exports = MessageReactionAddEvent;
