const Command = require('../../structures/Command');

class TextCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'text',
      aliases: ['sms'],
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

    const [number, ...content] = args;
    if (!number) {
      message.error(message._('text.missingNumber'));
      return 0;
    }

    if (!content) {
      message.error(message._('text.missingContent'));
      return 0;
    }

    if (content.length > this.client.telephone.contracts.maxTextLength) {
      message.warn(message._('text.contentLength', this.client.telephone.contracts.maxTextLength));
      return 0;
    }

    const correspondent = await this.client.telephone.contracts.findContract(number);
    if (!correspondent) {
      message.warn(message._('text.unable', number));
      return 0;
    }

    if (!correspondent.textable) {
      message.warn(message._('text.unable', number));
      return 0;
    }

    const ret = await this.client.telephone.contracts.text(contract.id, correspondent.id, content)
      .then(() => {
        message.success(message._('text.sent', number));
        return 0;
      })
      .catch(() => {
        message.error(message._('text.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = TextCommand;
