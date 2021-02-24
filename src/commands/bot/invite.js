const Command = require('../../structures/Command');

class InviteCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'invite',
      dm: true,
    });
  }

  async main(message) {
    const invite = await this.client.generateInvite({ permissions: 3492928 });
    message.send(message._('invite.invite', message.emote('homer'), invite));
    return 0;
  }
}

module.exports = InviteCommand;
