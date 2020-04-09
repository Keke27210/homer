const Command = require('../../structures/Command');

class PickupCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'pickup',
      dm: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contracts.fetchContract(message.channel.id);
    if (!contract) {
      message.send(message._('telephone.unknown'));
      return 0;
    }

    if (contract.state === this.client.telephone.contracts.states.PENDING) {
      message.send(message._('telephone.pending'));
      return 0;
    }

    if (contract.state === this.client.telephone.contracts.states.PAUSED) {
      message.send(message._('telephone.paused'));
      return 0;
    }

    const call = await this.client.telephone.calls.findCall(contract.id);
    if (!call || call.state > this.client.telephone.calls.states.PENDING) {
      message.info(message._('pickup.noPending'));
      return 0;
    }

    if (call.caller === contract.id) {
      message.warn(message._('pickup.asCaller'));
      return 0;
    }

    const ret = await this.client.telephone.calls.pickupCall(call.id)
      .catch(() => {
        message.error(message._('pickup.error'));
      });

    return ret;
  }
}

module.exports = PickupCommand;
