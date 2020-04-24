const Command = require('../../structures/Command');

class ToggleSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'toggle',
      aliases: ['switch'],
      dm: true,
    });
  }

  async main(message) {
    const contract = await this.client.telephone.contracts.fetchContract(message.channel.id);
    if (!contract) {
      message.send(message._('telephone.unknown'));
      return 0;
    }

    const entry = await this.client.telephone.phonebook.getRow(contract.id);
    if (!entry || !entry.message) {
      message.warn(message._('phonebook.toggle.message'));
      return 0;
    }

    const ret = await this.client.telephone.phonebook.toggleDisplay(contract.id)
      .then((val) => {
        message.success(message._(`phonebook.toggle.${val ? 'visible' : 'invisible'}`));
        return 0;
      })
      .catch(() => {
        message.error(message._('phonebook.toggle.error'));
        return 1;
      });

    return ret;
  }
}

class MessageSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'message',
      aliases: ['set'],
      dm: true,
    });
  }

  async main(message, args) {
    const msg = args.join(' ');
    if (!msg) {
      message.error(message._('phonebook.message.missing'));
      return 0;
    }

    if (msg.length > this.client.telephone.phonebook.maxLength) {
      message.warn(message._('phonebook.message.length', this.client.telephone.phonebook.maxLength));
      return 0;
    }

    const contract = await this.client.telephone.contracts.fetchContract(message.channel.id);
    if (!contract) {
      message.send(message._('telephone.unknown'));
      return 0;
    }

    let entry = await this.client.telephone.phonebook.getRow(contract.id);
    if (!entry) entry = await this.client.telephone.phonebook.createBook(contract.id);

    const ret = await this.client.telephone.phonebook.setMessage(entry.id, msg)
      .then(() => {
        message.success(message._('phonebook.message.set', msg));
        return 0;
      })
      .catch(() => {
        message.error(message._('phonebook.message.error'));
        return 1;
      });

    return ret;
  }
}

class PhonebookCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'phonebook',
      children: [
        new ToggleSubcommand(client, category),
        new MessageSubcommand(client, category),
      ],
      dm: true,
    });
  }

  async main(message) {
    const entries = await this.client.telephone.phonebook.fetchDisplayable();
    if (!entries.length) {
      message.info(message._('phonebook.empty'));
      return 0;
    }

    let support;

    const description = [];
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      const contract = await this.client.telephone.contracts.getRow(entry.id);
      if (contract) {
        if (contract.number === 'SUPPORT') {
          support = entry.message;
          continue;
        } else if (contract.state === this.client.telephone.contracts.states.ACTIVE) {
          description.push(`${message.dot} \`${contract.number}\`: ${entry.message}`);
        }
      }
    }

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('phonebook.title'),
      null,
      [`${message.dot} \`SUPPORT\`: ${support}`, description.sort((a, b) => a.localeCompare(b))].flat(),
    );

    return 0;
  }
}

module.exports = PhonebookCommand;
