const Command = require('../../structures/Command');

class LeaveCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'leave',
      aliases: ['stop', 'stfu'],
    });
  }

  async main(message) {
    const { voice } = message.guild;
    if (!voice || !voice.channelID) {
      message.error(message._('leave.none'));
      return 0;
    }

    const ret = await this.client.audioManager.destroySession(voice.channelID, true)
      .then(() => {
        message.success(message._('leave.success', voice.channel.name));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[commands->leave] Error while leaving channel ${voice.id}`, error);
        message.error(message._('leave.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = LeaveCommand;
