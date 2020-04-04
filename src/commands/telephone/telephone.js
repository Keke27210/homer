const Command = require('../../structures/Command');

class SubscribeSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'subscribe',
      botPermissions: ['ADD_REACTIONS'],
      dm: true,
      private: true,
    });
  }

  async main(message) {
    const active = await this.client.telephoneManager.fetchContract(message.channel.id);
    if (active) {
      message.warn(message._('telephone.subscribe.occupiedChannel', active.line));
      return 0;
    }

    const m = await message.warn(message._('telephone.subscribe.disclaimer', message.channel.name));
    const decision = await m.awaitUserApproval(message.author.id);
    if (decision) {
      m.editLoading(message._('telephone.subscribe.eligibility'));
      const eligibility = await this.client.telephoneManager
        .eligibility(message.channel.id, message.author.id);
      if (eligibility !== 'OK') {
        m.editError(message._(`telephone.subscribe.error.${eligibility}`));
        return 0;
      }

      const contractID = await this.client.telephoneManager.createContract(
        message.guild ? message.guild.id : message.author.id,
        message.channel.id,
        message.author.id,
      );
      if (contractID === 0) {
        m.editError(message._('telephone.subscribe.error.unknown'));
        return 1;
      }
      m.editSuccess(message._('telephone.subscribe.applied', contractID));
      return 0;
    }

    m.editWarn(message._('telephone.subscribe.aborted'));
    return 0;
  }
}

class TelephoneCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'telephone',
      aliases: ['phone'],
      children: [new SubscribeSubcommand(client, category)],
      dm: true,
      private: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephoneManager.fetchContract(message.channel.id);
    if (!contract) {
      message.send(message._('telephone.welcome', `${this.client.commandManager.prefixes[0]}telephone subscribe`));
      return 0;
    }
    if (contract.state === 0) {
      message.send(message._('telephone.pending'));
      return 0;
    }

    message.send('WIP');
    return 0;
  }
}

module.exports = TelephoneCommand;
