const Command = require('../../structures/Command');

class PickupCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'pickup',
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
    if (!call || call.state > 0) {
      message.warn(message._('pickup.noPending'));
      return 0;
    }

    if (call.caller === contract.id) {
      message.info(message._('pickup.asCaller'));
      return 0;
    }

    const ret = await this.client.telephone.callManager.pickupCall(call.id);
    if (ret) {
      message.warn(message._(`pickup.error.${ret}`));
    }

    return 0;
  }
}

module.exports = PickupCommand;
