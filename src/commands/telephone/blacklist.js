const Command = require('../../structures/Command');

class AddSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'add',
      userPermission: ['MANAGE_GUILD'],
      dm: true,
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
      message.error(message._('blacklist.missing'));
      return 0;
    }

    if (!/^[a-zA-Z\d]{3}-[a-zA-Z\d]{3}$/.test(number)) {
      message.error(message._('blacklist.format'));
      return 0;
    }

    if (contract.blacklist.includes(number)) {
      message.warn(message._('blacklist.add.already', number));
      return 0;
    }

    const ret = await this.client.telephone.contracts.blacklist(contract.id, number)
      .then(() => {
        message.success(message._('blacklist.add.added', number));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[commands->blacklist->add] Unable to add ${number} to ${contract.id}'s blacklist`, error);
        message.error(message._('blacklist.add.error'));
        return 1;
      });

    return ret;
  }
}

class RemoveSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'remove',
      userPermission: ['MANAGE_GUILD'],
      dm: true,
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
      message.error(message._('blacklist.missing'));
      return 0;
    }

    if (!/^[a-zA-Z\d]{3}-[a-zA-Z\d]{3}$/.test(number)) {
      message.error(message._('blacklist.format'));
      return 0;
    }

    if (!contract.blacklist.includes(number)) {
      message.warn(message._('blacklist.remove.unknown', number));
      return 0;
    }

    const ret = await this.client.telephone.contracts.unblacklist(contract.id, number)
      .then(() => {
        message.success(message._('blacklist.remove.removed', number));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[commands->blacklist->remove] Unable to remove ${number} from ${contract.id}'s blacklist`, error);
        message.error(message._('blacklist.remove.error'));
        return 1;
      });

    return ret;
  }
}

class BlacklistCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'blacklist',
      children: [
        new AddSubcommand(client, category),
        new RemoveSubcommand(client, category),
      ],
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

    if (!contract.blacklist.length) {
      message.info(message._('blacklist.empty'));
      return 0;
    }

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('blacklist.list'),
      null,
      contract.blacklist.map((b) => `${message.dot} \`${b}\``),
    );

    return 0;
  }
}

module.exports = BlacklistCommand;
