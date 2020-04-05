const Command = require('../../structures/Command');

class HangupCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'hangup',
      dm: true,
      private: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contractManager.fetchContract(message.channel.id);
    if (!contract) {
      message.info(message._('telephone.contractRequired', `${this.client.commandManager.prefixes[0]}telephone`));
      return 0;
    }

    const call = await this.client.telephone.callManager.findCall(contract.id);
    if (!call) {
      message.warn(message._('hangup.none'));
      return 0;
    }

    const ret = await this.client.telephone.callManager.deleteCall(call.id, 'user');
    if (ret) {
      message.warn(message._(`hangup.error.${ret}`));
    }

    return 0;
  }
}

module.exports = HangupCommand;
