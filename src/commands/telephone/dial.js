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
    const contract = await this.client.telephone.contractManager.fetchContract(message.channel.id);
    if (!contract) {
      message.info(message._('telephone.contractRequired', `${this.client.commandManager.prefixes[0]}telephone`));
      return 0;
    }

    const [number] = args;
    if (!number) {
      message.error(message._('dial.number'));
      return 0;
    }

    const correspondent = await this.client.telephone.contractManager.findContract(number);
    if (!correspondent) {
      message.warn(message._('dial.unknown', number));
      return 0;
    }

    const ret = await this.client.telephone.callManager.createCall(contract.id, correspondent.id);
    if (ret) {
      message.warn(message._(`dial.error.${ret}`));
    }

    return 0;
  }
}

module.exports = DialCommand;
