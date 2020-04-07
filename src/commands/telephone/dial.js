const Command = require('../../structures/Command');

class DialCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'dial',
      aliases: ['call'],
      dm: true,
      private: true,
    });
  }

  async main(message, args) {
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

    const [number] = args;
    if (!number) {
      message.error(message._('dial.noNumber'));
      return 0;
    }

    const correspondent = await this.client.telephone.contracts.findContract(number);
    if (!correspondent) {
      message.warn(message._('dial.unknown', number));
      return 0;
    }

    const call = await Promise.all([
      this.client.telephone.calls.findCall(contract.id),
      this.client.telephone.calls.findCall(correspondent.id),
    ]);

    if (call[0] || number === contract.number) {
      message.info(message._('dial.busy'));
      return 0;
    }

    if (call[1] || correspondent.blacklist.includes(contract.number)) {
      message.info(message._('dial.correspondentBusy'));
      return 0;
    }

    const ret = await this.client.telephone.calls.createCall(contract.id, correspondent.id)
      .then(() => 0)
      .catch(() => {
        message.error(message._('dial.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = DialCommand;
