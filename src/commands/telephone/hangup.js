const Command = require('../../structures/Command');

class HangupCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'hangup',
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
    if (!call || call.state > this.client.telephone.calls.states.ONGOING) {
      message.send(message._('hangup.noActive'));
      return 0;
    }

    const ret = await this.client.telephone.calls.endCall(call.id, 'TERMINATED')
      .then(() => 0)
      .catch(() => {
        message.error(message._('hangup.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = HangupCommand;
