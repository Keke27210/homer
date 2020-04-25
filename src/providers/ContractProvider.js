const { MessageEmbed } = require('discord.js');

const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'SERIAL', 'PRIMARY KEY'],
  ['context', 'VARCHAR(20)', 'NOT NULL'],
  ['channel', 'VARCHAR(20)', 'NOT NULL'],
  ['subscriber', 'VARCHAR(20)', 'NOT NULL'],
  ['number', 'VARCHAR(7)', null],
  ['state', 'int', 'NOT NULL'],
  ['textable', 'bool', 'NOT NULL'],
  ['blacklist', 'VARCHAR(7)', 'ARRAY'],
  ['edited', 'TIMESTAMP', null],
  ['created', 'TIMESTAMP', 'NOT NULL'],
];

function threeDigits() {
  return Math.random().toString().substring(2, 5);
}

class ContractProvider extends Provider {
  constructor(client) {
    super(client, 'contracts', TABLE_COLUMNS, false);

    /**
     * States for a contract
     * @type {number}
     */
    this.states = {
      PENDING: 0,
      ACTIVE: 1,
      PAUSED: 2,
      TERMINATED: 3,
      SUSPENDED: 4,
      INVALIDATED: 5,
    };

    /**
     * Maximum length of a text message
     * @type {number}
     */
    this.maxTextLength = 512;

    /**
     * Maximum number of simultaneous active contracts
     * @type {number}
     */
    this.maxActive = 2;

    /**
     * Time required between two contract signatures
     * Current: 2 weeks
     * @type {number}
     */
    this.delaySignature = (2 * 7 * 24 * 60 * 60 * 1000);

    /**
     * Time required following a contract suspension
     * Current: 4 weeks
     * @type {number}
     */
    this.delaySuspension = (4 * 7 * 24 * 60 * 60 * 1000);

    // Set listeners
    this.client.on('ready', this.checkInvalid.bind(this));
    this.client.on('channelDelete', this.channelDelete.bind(this));
    this.client.on('guildDelete', this.guildDelete.bind(this));
  }

  /**
   * Creates a contract
   * @param {string} context Context ID
   * @param {string} channel Channel ID
   * @param {string} subscriber Subscriber ID
   * @returns {Promise<number>} Contract ID
   */
  async createContract(context, channel, subscriber) {
    if (!this.client.channels.resolve(channel)) {
      throw new Error('UNKNOWN_CHANNEL');
    }

    if (!this.client.users.resolve(subscriber)) {
      throw new Error('UNKNOWN_SUBSCRIBER');
    }

    const existing = await this.getRows([
      ['context', '=', context],
      ['channel', '=', channel],
      ['subscriber', '=', subscriber],
      ['state', '<', this.states.TERMINATED],
    ])
      .catch((error) => {
        this.client.logger.error(`[contracts->createContract] Cannot check existing contracts for channel ${channel} / subscriber ${subscriber} / context ${context}`, error);
        throw new Error('DATABASE_ERROR');
      });

    if (existing.length) {
      throw new Error('EXISTING_CONTRACT');
    }

    const now = new Date();
    const id = await this.insertRow({
      context,
      channel,
      subscriber,
      textable: true,
      state: this.states.PENDING,
      blacklist: [],
      created: now,
    })
      .catch((error) => {
        this.client.logger.error(`[contracts->createContract] Cannot create contract for channel ${channel} / subscriber ${subscriber} / context ${context}`, error);
        throw new Error('DATABASE_ERROR');
      });

    return id;
  }

  /**
   * Activates a contract
   * @param {number} id Contract ID
   * @returns {Promise<string>} Generated number
   */
  async activateContract(id) {
    const existing = await this.getRow(id);
    if (!existing) {
      throw new Error('UNKNOWN_CONTRACT');
    }

    if (existing.state === this.states.ACTIVE) {
      throw new Error('ALREADY_ACTIVATED');
    }

    const number = await this.generateNumber();

    await this.updateRow(id, {
      number,
      state: this.states.ACTIVE,
      edited: new Date(),
    })
      .catch((error) => {
        this.client.logger.error(`[contracts->activateContract] Cannot activate contract ID ${id}`, error);
        throw new Error('DATABASE_ERROR');
      });

    this.notify(id, true, 'telephone.notifications.activated', number);

    return number;
  }

  /**
   * Terminates a contract
   * @param {number} id Contract ID
   * @param {'TERMINATED'|'SUSPENDED'|'INVALIDATED'} type Termination type
   * @returns {Promise<void>}
   */
  async terminateContract(id, type) {
    if (!this.states[type]) {
      throw new Error('UNKNOWN_TYPE');
    }

    const existing = await this.getRow(id);
    if (!existing) {
      throw new Error('UNKNOWN_CONTRACT');
    }

    if (existing.state > this.states.ACTIVE) {
      throw new Error('ALREADY_TERMINATED');
    }

    await this.updateRow(id, {
      state: this.states[type],
      edited: new Date(),
    })
      .catch((error) => {
        this.client.logger.error(`[contracts->terminateContract] Cannot terminate contract ID ${id} (${type})`, error);
        throw new Error('DATABASE_ERROR');
      });

    const book = await this.client.telephone.phonebook.getRow(id);
    if (book && book.visible) await this.client.telephone.phonebook.toggleDisplay(id);

    return null;
  }

  /**
   * Pauses or resumes a contract
   * @param {number} id Contract ID
   * @returns {Promise<number>} New state
   */
  async toggleContract(id) {
    const existing = await this.getRow(id);
    if (!existing) {
      throw new Error('UNKNOWN_CONTRACT');
    }

    if (existing.state === this.states.PENDING) throw new Error('PENDING_CONTRACT');
    if (existing.state > this.states.PAUSED) throw new Error('TERMINATED_CONTRACT');

    const state = existing.state === this.states.ACTIVE
      ? this.states.PAUSED
      : this.states.ACTIVE;

    await this.updateRow(id, {
      state,
      edited: new Date(),
    });

    this.notify(id, true, `telephone.notifications.${state === this.states.ACTIVE ? 'resumed' : 'paused'}`);

    return state;
  }

  /**
   * Finds a contract using telephone number
   * @param {string} number Telephone number
   * @returns {Promise<?Contract>} Contract
   */
  async findContract(number) {
    const contracts = await this.getRows([
      ['state', '=', this.states.ACTIVE],
      ['number', '=', number],
    ]);
    return contracts[0] || null;
  }

  /**
   * Fetches a contract using channel ID
   * @param {string} channel Channel ID
   * @returns {Promise<?Contract>} Contract
   */
  async fetchContract(channel) {
    const contracts = await this.getRows([
      ['state', '<', this.states.TERMINATED],
      ['channel', '=', channel],
    ]);
    return contracts[0] || null;
  }

  /**
   * Fetches pending contracts
   * @returns {Promise<Contract[]>} Contracts
   */
  async fetchPending() {
    return this.getRows([
      ['state', '=', this.states.PENDING],
    ]);
  }

  /**
   * Make sure that the subscriber and possibly the server are eligible
   * @param {string} subscriber Subscriber ID
   * @param {?string} guild Guild ID
   * @returns {Promise<boolean>} Eligibility
   */
  async eligibility(subscriber, guild) {
    let eligibility = true;
    eligibility = await this.checkDelays(subscriber);
    if (guild) eligibility = await this.checkDelays(guild);
    return eligibility;
  }

  /**
   * Verifies compliance with signature and suspension delays
   * @param {string} instance Instance to check
   * @returns {Promise<boolean>} Compliance
   */
  async checkDelays(instance) {
    const contracts = await this.getRows([
      [['context', '=', instance], ['subscriber', '=', instance]],
    ]);
    if (!contracts.length) return true;

    const count = contracts.filter((c) => c.state < this.states.TERMINATED).length;
    if (count >= this.maxActive) return false;

    const suspensions = contracts.filter((c) => c.state === this.states.SUSPENDED
      && (Date.now() - c.edited.getTime()) < this.delaySuspension);
    if (suspensions.length) return false;

    const recent = contracts.filter(
      (c) => (Date.now() - c.created.getTime()) < this.delaySignature,
    );
    if (recent.length) return false;

    return true;
  }

  /**
   * Blacklists a number
   * @param {number} id Contract ID
   * @param {string} number Number to blacklist
   */
  async blacklist(id, number) {
    const contract = await this.getRow(id);
    if (!contract) throw new Error('UNKNOWN_CONTRACT');

    if (contract.blacklist.includes(number)) throw new Error('ALREADY_BLACKLISTED');
    contract.blacklist.push(number);

    await this.updateRow(id, {
      blacklist: contract.blacklist,
      edited: new Date(),
    });

    return null;
  }

  /**
   * Unblacklists a number
   * @param {number} id Contract ID
   * @param {string} number Number to unblacklist
   */
  async unblacklist(id, number) {
    const contract = await this.getRow(id);
    if (!contract) throw new Error('UNKNOWN_CONTRACT');

    const index = contract.blacklist.indexOf(number);
    if (index === -1) throw new Error('NOT_BLACKLISTED');
    contract.blacklist.splice(index, 1);

    await this.updateRow(id, {
      blacklist: contract.blacklist,
      edited: new Date(),
    });

    return null;
  }

  /**
   * Sends a text message
   * @param {number} id Contract ID
   * @param {number} dest Correspondent's contract ID
   * @param {string} message Message to send
   * @returns {Promise<void>}
   */
  async text(id, dest, message) {
    if (message.length > this.maxTextLength) throw new Error('MESSAGE_LENGTH');

    const contract = await this.getRow(id);
    if (!contract) throw new Error('UNKNOWN_CONTRACT');

    const correspondent = await this.getRow(dest);
    if (!correspondent) throw new Error('UNKNOWN_CORRESPONDENT');

    const settings = await this.client.settings.fetchSettings(correspondent.context);

    await this.notify(
      correspondent.id,
      true,
      'telephone.notifications.text',
      new MessageEmbed().setDescription(message).setFooter(this.client.localeManager.translate(settings.locale, 'telephone.hint.text', contract.number)),
      contract.number,
      message,
    );

    return null;
  }

  /**
   * Sends a message in the contract's channel
   * @param {number} id Contract ID
   * @param {boolean} translate Whether pass through LocaleManager#translate
   * @param {string} message Message (or translation key)
   * @param  {...any} args Translator arguments
   * @returns {Promise<Message>} Message sent
   */
  async notify(id, translate, message, ...args) {
    const contract = await this.getRow(id);
    if (!contract) {
      throw new Error('UNKNOWN_CONTRACT');
    }

    let embed = null;
    if (args[0] instanceof MessageEmbed) {
      embed = args.shift();
    }

    const content = translate
      ? this.client.localeManager.translate('en-gb', message, ...args)
      : message;
    const m = await this.client.api.channels[contract.channel].messages
      .post({
        data: { content, embed },
      })
      .catch((error) => {
        this.client.logger.warn(`[contracts->notify] Cannot send a message in channel ${contract.channel}`, error);
        throw new Error('SENDING_ERROR');
      });

    return m;
  }

  /**
   * Generates a valid number
   * @returns {Promise<number>} Generated number
   */
  async generateNumber() {
    let number;
    for (let i = 0; i < 10; i += 1) {
      const generated = `${threeDigits()}-${threeDigits()}`;
      const existing = await this.getRows([
        ['number', '=', generated],
      ]);
      if (!existing.length) {
        number = generated;
        break;
      }
    }

    if (!number) {
      throw new Error('FAILED_GENERATION');
    }

    return number;
  }

  /**
   * Fetches invalid contracts (missing channel basically) and invalidates them
   * @returns {Promise<number>} Number of terminated contracts
   */
  async checkInvalid() {
    const list = await this.getRows([
      ['state', '<', this.states.TERMINATED],
    ]);
    let j = 0;
    for (let i = 0; i < list.length; i += 1) {
      const channel = await this.client.api.channels[list[i].channel].get()
        .catch(() => null);
      if (!channel) {
        await this.terminateContract(list[i].id, 'INVALIDATED');
        j += 1;
      }
    }
    if (j > 0) this.client.logger.log(`[contracts->checkInvalid] Invalidated ${j} contracts`);
    return j;
  }

  /**
   * Invalidates contract of a deleted channel
   * @param {Channel} channel Channel
   * @returns {Promise<void>}
   */
  async channelDelete(channel) {
    const contract = await this.fetchContract(channel.id);
    if (!contract) return null;
    await this.terminateContract(contract.id, 'INVALIDATED');
    return null;
  }

  /**
   * Invalidates contracts of a deleted guild
   * @param {Guild} guild Guild
   * @returns {Promise<void>}
   */
  async guildDelete(guild) {
    const contracts = await this.getRows([
      ['context', '=', guild.id],
      ['state', '<', this.states.TERMINATED],
    ]);
    for (let i = 0; i < contracts.length; i += 1) {
      await this.terminateContract(contracts[i].id, 'INVALIDATED');
    }
    return null;
  }
}

module.exports = ContractProvider;
