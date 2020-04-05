const Command = require('../../structures/Command');

// telephone->subscribe
class SubscribeSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'subscribe',
      dm: true,
      private: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contractManager.fetchContract(message.channel.id);
    if (contract) {
      message.warn(message._('telephone.occupiedChannel', contract.id));
      return 0;
    }

    const m = await message.warn(message._('telephone.subscribe.disclaimer', message.channel.name));
    const decision = await m.awaitUserApproval(message.author.id);
    if (decision) {
      m.editLoading(message._('telephone.subscribe.eligibility'));
      const eligibility = await this.client.telephone.contractManager
        .eligibility(message.channel.id, message.author.id);
      if (eligibility !== 'OK') {
        const [context, key] = eligibility.split('.');
        m.editError(message._(
          `telephone.subscribe.error.${eligibility}`,
          key === 'too_many'
            ? this.client.telephone.contractManager[context === 'guild' ? 'maxPerGuild' : 'maxPerUser']
            : null,
        ));
        return 0;
      }

      const contractID = await this.client.telephone.contractManager.createContract(
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

// telephone->terminate
class TerminateSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'terminate',
      dm: true,
      private: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contractManager.fetchContract(message.channel.id);
    if (!contract) {
      message.warn(message._('telephone.unusedChannel'));
      return 0;
    }

    const m = await message.warn(message._('telephone.terminate.disclaimer'));
    const decision = await m.awaitUserApproval(message.author.id);
    if (decision) {
      const res = await this.client.telephone.contractManager.terminateContract(contract.id)
        .catch((e) => e);
      if (res) {
        m.editError(message._('telephone.terminate.error'));
        this.client.logger.error(`[command->telephone->terminate] Error while terminating subscription no. ${contract.id}`, res);
        return 1;
      }

      m.editSuccess(message._('telephone.terminate.done', contract.id));
      return 0;
    }

    m.editWarn(message._('telephone.terminate.aborted'));
    return 0;
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

    const res = await this.client.telephone.contractManager.activateContract(id);
    if (!/^[a-zA-Z\d]{3}-[a-zA-Z\d]{3}$/.test(res)) {
      message.error(`An error occured while activating contract no.\`${id}\`:\`\`\`js\n${res}\`\`\``);
      return 0;
    }

    await this.client.telephone.contractManager.notify(id, 'telephone.notification.approved', res, `${this.client.commandManager.prefixes[0]}call`)
      .then(() => message.success(`Contract n°\`${id}\` activated successfully with number **${res}**.`))
      .catch(() => message.warn(`Contract n°\`${id}\` activated successfully with number **${res}** but couldn't notify.`));
    return 0;
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

    const res = await this.client.telephone.contractManager.invalidateContract(id);
    if (res) {
      message.error(`An error occured while rejecting contract no.\`${id}\`:\`\`\`js\n${res}\`\`\``);
      return 0;
    }

    await this.client.telephone.contractManager.notify(id, 'telephone.notification.denied')
      .then(() => message.success(`Contract n°\`${id}\` rejected`))
      .catch(() => message.warn(`Contract n°\`${id}\` rejected but couldn't notify.`));
    return 0;
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
    const pending = await this.client.telephone.contractManager.fetchPending();
    if (!pending.length) {
      message.warn('There are no current subscription requests.');
      return 0;
    }

    const description = [];
    for (let i = 0; i < pending.length; i += 1) {
      const contract = pending[i];
      const guild = (contract.context === contract.subscriber) ? 'None' : this.client.guilds.resolve(contract.context);
      const user = await this.client.users.fetch(contract.subscriber).catch(() => null);
      // eslint-disable-next-line no-nested-ternary
      description.push(`${message.dot} Contract n°\`${contract.id}\` - Subscriber: ${user ? `${user.tag} (${user.id})` : 'Unknown'} - Guild: ${guild === 'None' ? 'DM' : (guild ? `**${guild.name}** (${guild.id})` : 'Unknown')}`);
    }

    const embed = message.getEmbed().setDescription(description.join('\n'));
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
      ],
      dm: true,
      private: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contractManager.fetchContract(message.channel.id);
    if (!contract) {
      message.send(message._('telephone.welcome', `${this.client.commandManager.prefixes[0]}telephone subscribe`));
      return 0;
    }

    const subscriber = await this.client.users.fetch(contract.subscriber)
      .catch(() => null);

    const description = [
      `${message.dot} ${message._('telephone.contract.id')}: \`${contract.id}\``,
      `${message.dot} ${message._('telephone.contract.number')}: **${contract.line === 'XXX-XXX' ? message._('telephone.contract.notAttributed') : contract.line}**`,
      `${message.dot} ${message._('telephone.contract.subscriber')}: ${subscriber.tag}`,
      `${message.dot} ${message._('telephone.contract.state')}: **${message._(`telephone.contract.states.${contract.state}`)}**`,
      `${message.dot} ${message._('telephone.contract.textable')}: **${message._(`global.${contract.textable ? 'yes' : 'no'}`)}**`,
      `${message.dot} ${message._('telephone.contract.date')}: ${message.getMoment(contract.created.getTime())}`,
    ].join('\n');

    const embed = message.getEmbed().setDescription(description);
    message.send(message._('telephone.contract.title'), embed);
    return 0;
  }
}

module.exports = TelephoneCommand;
