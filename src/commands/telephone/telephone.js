const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

// telephone->subscribe
class SubscribeSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'subscribe',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contracts.fetchContract(message.channel.id);
    if (contract) {
      message.info(message._('telephone.existing', contract.id));
      return 0;
    }

    const m = await message.warn(message._('telephone.subscribe.disclaimer'));
    const decision = await m.awaitUserApproval(message.author.id);
    if (decision) {
      m.editLoading(message._('telephone.subscribe.eligibility'));
      const eligibility = await this.client.telephone.contracts.eligibility(
        message.author.id,
        message.guild ? message.guild.id : null,
      );
      if (!eligibility) {
        m.editError(message._('telephone.subscribe.notEligible'));
        return 0;
      }

      const ret = await this.client.telephone.contracts.createContract(
        message.guild ? message.guild.id : message.author.id,
        message.channel.id,
        message.author.id,
      )
        .then((id) => {
          m.editSuccess(message._('telephone.subscribe.applied', id));
          return 0;
        })
        .catch(() => {
          m.editError(message._('telephone.subscribe.error'));
          return 1;
        });

      return ret;
    }

    m.editInfo(message._('telephone.subscribe.aborted'));
    return 0;
  }
}

// telephone->terminate
class TerminateSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'terminate',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contracts.fetchContract(message.channel.id);
    if (!contract) {
      message.info(message._('telephone.unknown'));
      return 0;
    }

    const m = await message.warn(message._('telephone.terminate.disclaimer'));
    const decision = await m.awaitUserApproval(message.author.id);
    if (decision) {
      const ret = await this.client.telephone.contracts.terminateContract(contract.id, 'TERMINATED')
        .then(() => {
          m.editSuccess(message._('telephone.terminate.done', contract.id));
          return 0;
        })
        .catch(() => {
          m.editError(message._('telephone.terminate.error'));
          return 1;
        });

      return ret;
    }

    m.editInfo(message._('telephone.terminate.aborted'));
    return 0;
  }
}

// telephone->toggle
class ToggleSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'toggle',
      aliases: ['switch'],
      userPermissions: ['MANAGE_GUILD'],
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

    if (contract.state === this.client.telephone.contracts.states.ACTIVE) {
      contract.state = this.client.telephone.contracts.states.PAUSED;
    } else {
      contract.state = this.client.telephone.contracts.states.ACTIVE;
    }

    const ret = await this.client.telephone.contracts.toggleContract(contract.id)
      .then(() => 0)
      .catch(() => {
        message.error(message._('telephone.toggle.error'));
        return 1;
      });

    return ret;
  }
}

// telephone->contracts->approve
class ApproveSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'approve',
      private: true,
      dm: true,
    });
  }

  async main(message, args) {
    let [id] = args;
    if (!id) {
      message.error('You must provide the no. of a contract to approve.');
      return 0;
    }

    id = Number(id);
    if (Number.isNaN(id)) {
      message.warn(`\`${id}\` is not a number.`);
      return 0;
    }

    const ret = await this.client.telephone.contracts.activateContract(id)
      .then(() => {
        message.success(`Successfully activated contract no. \`${id}\`.`);
        return 0;
      })
      .catch((error) => {
        message.error(`An error occured while activating contract no. \`${id}\`: \`${error.message}\`.`);
        return 1;
      });

    return ret;
  }
}

// telephone->contracts->reject
class RejectSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'reject',
      private: true,
      dm: true,
    });
  }

  async main(message, args) {
    let [id] = args;
    if (!id) {
      message.error('You must provide the no. of a contract to reject.');
      return 0;
    }

    id = Number(id);
    if (Number.isNaN(id)) {
      message.warn(`\`${id}\` is not a number.`);
      return 0;
    }

    const ret = await this.client.telephone.contracts.terminateContract(id, 'INVALIDATED')
      .then(() => {
        message.success(`Successfully invalidated contract no. \`${id}\`.`);
        return 0;
      })
      .catch((error) => {
        message.error(`An error occured while invalidating contract no. \`${id}\`: \`${error}\`.`);
        return 1;
      });

    return ret;
  }
}

// telephone->contracts
class ContractsSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'contracts',
      children: [
        new ApproveSubcommand(client, category),
        new RejectSubcommand(client, category),
      ],
      private: true,
      dm: true,
    });
  }

  async main(message) {
    const pending = await this.client.telephone.contracts.fetchPending();
    if (!pending.length) {
      message.warn('There are no current subscription requests.');
      return 0;
    }

    const description = [];
    for (let i = 0; i < pending.length; i += 1) {
      const contract = pending[i];
      const guild = (contract.context === contract.subscriber)
        ? null
        : (await this.client.api.guilds(contract.context).get().catch(() => null));
      const user = await this.client.users.fetch(contract.subscriber).catch(() => null);
      description.push(`${message.dot} Contract n°\`${contract.id}\` - Subscriber: ${user ? `${user.tag} (${user.id})` : 'Unknown'} - Guild: ${guild ? `**${guild.name}** (${guild.id})` : 'Direct Messages'}`);
    }

    const embed = new MessageEmbed().setDescription(description.join('\n'));
    message.send('☎️ Current subscription requests:', embed);
    return 0;
  }
}

class TelephoneCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'telephone',
      aliases: ['phone'],
      children: [
        new SubscribeSubcommand(client, category),
        new TerminateSubcommand(client, category),
        new ContractsSubcommand(client, category),
        new ToggleSubcommand(client, category),
      ],
      dm: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contracts.fetchContract(message.channel.id);
    if (!contract) {
      message.send(message._('telephone.welcome'));
      return 0;
    }

    const subscriber = await this.client.users.fetch(contract.subscriber)
      .catch(() => null);

    const description = [
      `${message.dot} ${message._('telephone.contract.id')}: \`${contract.id}\``,
      `${message.dot} ${message._('telephone.contract.number')}: **${contract.number || message._('telephone.contract.noNumber')}**`,
      `${message.dot} ${message._('telephone.contract.subscriber')}: ${subscriber.tag}`,
      `${message.dot} ${message._('telephone.contract.state')}: **${message._(`telephone.states.${contract.state}`)}**`,
      `${message.dot} ${message._('telephone.contract.textable')}: **${message._(`global.${contract.textable ? 'yes' : 'no'}`)}**`,
      `${message.dot} ${message._('telephone.contract.date')}: ${message.getMoment(contract.created.getTime())}`,
    ].join('\n');

    const embed = new MessageEmbed().setDescription(description);
    message.send(message._('telephone.contract.title'), embed);
    return 0;
  }
}

module.exports = TelephoneCommand;
