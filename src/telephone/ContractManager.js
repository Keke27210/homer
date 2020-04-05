const Manager = require('../managers/Manager');

// States: 0 Pending | 1 Active | 2 Terminated | 3 Suspended | 4 Rejected | 5 Invalidated
// Invalidated: rejected subscription request or channel/guild deletion

const TABLE_COLUMNS = [
  // name - type - constraints - default value
  ['id', 'SERIAL', 'PRIMARY KEY', null],
  ['context', 'VARCHAR(20)', null, null],
  ['channel', 'VARCHAR(20)', null, null],
  ['subscriber', 'VARCHAR(20)', null, null],
  ['line', 'VARCHAR(7)', null, 'XXX-XXX'],
  ['active', 'bool', null, false],
  ['textable', 'bool', null, true],
  ['state', 'int', null, 0],
  ['edited', 'TIMESTAMP', null, null],
  ['created', 'TIMESTAMP', null, null],
];

class ContractManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Database cache for contracts
     * @type {Contract[]}
     */
    this.contracts = [];

    /**
     * Maximum amount of active contracts per guild or user
     * @type {number}
     */
    this.maxPerGuild = 2;
    this.maxPerUser = 2;

    /**
     * Required delay between two contract signatures
     * Current: 2 weeks
     * @type {number}
     */
    this.signatureDelay = 2 * 7 * 24 * 60 * 60 * 1000;

    /**
     * Required delay between a signature after a suspension
     * Current: 4 weeks
     * @type {number}
     */
    this.suspensionDelay = 4 * 7 * 24 * 60 * 60 * 1000;
  }

  /**
   * Creates a "contracts" table in the database if not exist
   */
  createTable() {
    if (!this.client.database.ready) return null;
    const columns = TABLE_COLUMNS.map((c) => `${c[0]} ${c[1]}${c[2] ? ` ${c[2]}` : ''}`).join(', ');
    return this.client.database.query(`CREATE TABLE IF NOT EXISTS contracts (${columns})`)
      .catch((error) => {
        this.client.logger.error('[contracts->createTable] Error while creating table', error);
      });
  }

  /**
   * Creates a contract for the specified channel
   * @param {string} context Context ID (guild or user ID)
   * @param {string} channel Channel ID
   * @param {string} subscriber Subscriber ID
   * @returns {Promise<number>} Contract no.
   */
  async createContract(context, channel, subscriber) {
    if (!this.client.channels.resolve(channel)) {
      throw new Error(`[contracts->createContract] Unknown channel ${channel}`);
    }

    // Checking for an existing active contract
    await this.client.database.query(
      'SELECT id FROM contracts WHERE context = $1 AND channel = $2 AND subscriber = $3 AND state < 2',
      [context, channel, subscriber],
    )
      .then((res) => {
        if (res.rows[0]) {
          throw new Error(`[contracts->createContract] There's already an active contract (${res.rows[0].id})`);
        }
      })
      .catch((error) => {
        this.client.logger.error(`[contracts->createContrat] Error while checking for active contracts (${context}/${channel}/${subscriber})`, error);
        throw new Error('[contracts->createContract] Unable to check for existing contracts');
      });

    // Inserting a new contract
    const now = new Date();
    await this.client.database.query(
      'INSERT INTO contracts (context, channel, subscriber, line, active, textable, state, edited, created) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [context, channel, subscriber, 'XXX-XXX', false, true, 0, now, now],
    )
      .catch((error) => {
        this.client.logger.error(`[contracts->createContrat] Error while creating a new contract (${context}/${channel}/${subscriber})`, error);
        throw new Error('[contracts->createContract] Unable to create your new contract');
      });

    // Fetching contract no.
    return this.client.database.query(
      'SELECT id FROM contracts WHERE context = $1 AND channel = $2 AND subscriber = $3 AND state = 0',
      [context, channel, subscriber],
    )
      .then((res) => (res.rows[0] ? res.rows[0].id : null))
      .catch((error) => {
        this.client.logger.error(`[contracts->createContrat] Error while fetching new contract no. (${context}/${channel}/${subscriber})`, error);
        throw new Error('[contracts->createContract] Unable to fetch contract no.');
      });
  }

  /**
   * Terminates an active contract
   * @param {string} id Contract no.
   */
  async terminateContract(id) {
    // Checking if there is an active contract with this ID
    await this.client.database.query('SELECT id FROM contracts WHERE id = $1', [id])
      .then((res) => {
        if (!res.rows[0]) {
          throw new Error(`[contracts->createContract] No active contract found with no. ${res.rows[0].id}`);
        }
      })
      .catch((error) => {
        this.client.logger.error(`[contracts->terminateContract] Error while checking for active contract no. ${id}`, error);
        throw new Error('[contracts->createContract] Unable to check for an active contract');
      });

    // Terminating this contract
    return this.client.database.query('UPDATE contracts SET state = 2 WHERE id = $1', [id])
      .then(() => {
        this.updateCache(id);
        return null;
      })
      .catch((error) => {
        this.client.logger.error(`[contracts->terminateContract] Unable to terminate contract no. ${id}`, error);
        throw new Error('[contracts->terminateContract] Unable to terminate this contract');
      });
  }

  /**
   * Fetches an active contract
   * @param {string} channel Channel ID
   * @param {?number} id Contract number
   * @param {?boolean} force Fetch even if state >= 2
   * @returns {Promise<?Contract>} Contract
   */
  fetchContract(channel, id, force = false) {
    const cached = this.contracts.find((c) => (force ? c.true : c.state < 2)
      && (c.channel === channel || c.id === id));
    if (cached) return cached;

    return this.client.database.query(`SELECT * FROM contracts WHERE ${force ? '' : 'state < 2 AND '}(channel = $1 OR id = $2)`, [channel, id])
      .then((res) => {
        if (!res.rows[0]) return null;
        this.contracts.push(res.rows[0]);
        return res.rows[0];
      })
      .catch((error) => {
        this.client.logger.error(`[contracts->fetchContract] Error while fetching contract for channel ${channel}`, error);
        throw new Error('[contracts->fetchContract] Unable to fetch active contract for this channel');
      });
  }

  /**
   * Fetches pending contracts
   * @returns {Promise<Contract[]>} Array of contracts
   */
  fetchPending() {
    return this.client.database.query('SELECT * FROM contracts WHERE state = 0')
      .then((res) => res.rows)
      .catch((error) => {
        this.client.logger.error('[contracts->fetchPending] Error while fetching pending contracts', error);
        throw new Error('[contracts->fetchPending] Unable to fetch pending contracts');
      });
  }

  /**
   * Checks if a contract can be created
   * @param {string} channel Channel ID
   * @param {string} subscriber User ID
   * @returns {Promise<string>} Decision
   */
  async eligibility(channel, subscriber) {
    if (!this.client.channels.resolve(channel)) {
      throw new Error(`[contracts->eligibility] Unknown channel ${channel}`);
    }

    const userContracts = await this.checkDelays(subscriber, 0);
    if (userContracts !== 'OK') return `user.${userContracts}`;

    const { guild } = this.client.channels.resolve(channel);
    if (guild) {
      const guildContracts = await this.checkDelays(guild.id, 1);
      if (guildContracts !== 'OK') return `guild.${guildContracts}`;
    }

    return 'OK';
  }

  /**
   * Checks contract delays for a specified context ID
   * @param {string} context Context ID
   * @param {number} type Context type (0: User / 1: Guild)
   * @returns {Promise<string>} Decision
   */
  async checkDelays(context, type) {
    const contracts = await this.client.database.query('SELECT id, state, edited, created FROM contracts WHERE context = $1 OR subscriber = $1', [context])
      .then((res) => res.rows)
      .catch((error) => {
        this.client.logger.error(`[contracts->checkDelays] Error while checking contracts for context ${context}`, error);
        throw new Error('[contracts->checkDelays] Error while checking delays for your context');
      });
    if (!contracts.length) return 'OK';

    const maxActive = contracts.filter(
      (c) => c.state < 2,
    ).length >= (type === 1 ? this.maxPerGuild : this.maxPerUser);
    if (maxActive) return 'too_many';

    const suspended = contracts.filter(
      (c) => c.state === 3 && Date.now() - c.edited.getTime() < this.suspensionDelay,
    );
    if (suspended.length) return 'suspended_contracts';

    const recent = contracts.filter(
      (c) => Date.now() - c.created.getTime() < this.subscriptionDelay,
    );
    if (recent.length) return 'recent_contracts';

    return 'OK';
  }

  /**
   * Generates an unused number
   * @returns {Promise<number>}
   */
  async generateNumber() {
    const threeDigits = () => Math.random().toString().substring(2, 5);
    let i = 0;
    let number;
    while (typeof number !== 'string' && i < 10) {
      const test = `${threeDigits()}-${threeDigits()}`;
      number = await this.client.database.query('SELECT id FROM contracts WHERE line = $1', [test])
        .then((res) => (res.rows.length ? undefined : test))
        .catch((error) => {
          this.client.logger.error('[contracts->generateNumber] Error while generating a number', error);
          return undefined;
        });
      i += 1;
    }
    return number || null;
  }

  /**
   * Activates a contract
   * @param {number} id Contract no.
   * @returns {Promise<string>} Line number
   */
  async activateContract(id) {
    const number = await this.generateNumber();
    if (!number) {
      this.client.logger.warn('[contract->activateContract] 10 iterations without available number!');
      throw new Error('[contracts->activateContract] Unable to generate an available number');
    }

    return this.client.database.query('UPDATE contracts SET state = 1, active = true, line = $1, edited = $2 WHERE id = $3', [number, new Date(), id])
      .then((res) => {
        if (!res.rowCount) {
          return new Error(`[contracts->activateContract] Invalid contract ID ${id}`);
        }

        this.updateCache(id);
        return number;
      })
      .catch((error) => {
        this.client.logger.error(`[contracts->activateContract] Error while activating contract no.${id}`, error);
        throw new Error('[contracts->activateContract] Error while activating this contract');
      });
  }

  /**
   * Suspends a contract
   * @param {number} id Contract no.
   */
  async suspendContract(id) {
    return this.client.database.query('UPDATE contracts SET state = 3, active = false, edited = $1 WHERE id = $2', [new Date(), id])
      .then((res) => {
        if (!res.rowCount) {
          return new Error(`[contracts->suspendContract] Invalid contract ID ${id}`);
        }

        this.updateCache(id);
        return null;
      })
      .catch((error) => {
        this.client.logger.error(`[contracts->suspendContract] Error while suspending contract no.${id}`, error);
        throw new Error('[contracts->suspendContract] Error while suspending this contract');
      });
  }

  /**
   * Invalidates a contract
   * @param {number} id Contract no.
   */
  invalidateContract(id) {
    return this.client.database.query('UPDATE contracts SET state = 5, active = false, edited = $1 WHERE id = $2', [new Date(), id])
      .then((res) => {
        if (!res.rowCount) {
          return new Error(`[contracts->invalidateContract] Invalid contract ID ${id}`);
        }

        this.updateCache(id);
        return null;
      })
      .catch((error) => {
        this.client.logger.error(`[contracts->invalidateContract] Error while invalidating contract no.${id}`, error);
        throw new Error('[contracts->invalidateContract] Error while invalidating this contract');
      });
  }

  /**
   * Notifies the given message to a channel's contract
   * @param {string} id Channel ID
   * @param  {string} key Translation key
   * @param {...any} args Translation arguments
   * @returns {Promise<Message>} Sent message
   */
  async notify(id, key, ...args) {
    const contract = await this.fetchContract(undefined, id, true);
    if (!contract) throw new Error(`[contracts->notify] Contract n°${id} could not be found`);

    const channel = this.client.channels.resolve(contract.channel);
    if (!channel) throw new Error(`[contracts->notify] Couldn't find channel for contract n°${id}`);

    const settings = await this.client.settingsUtil.fetchSettings(contract.context);
    return channel.send(this.client.localeManager.translate(settings.locale, key, ...args));
  }

  /**
   * Updates the cached version of a contract
   * @param {number} id Contract no.
   */
  async updateCache(id) {
    const contract = await this.client.database.query('SELECT * FROM contracts WHERE id = $1', [id])
      .then((res) => res.rows[0] || null)
      .catch(() => null);
    if (!contract) {
      this.client.logger.warn(`[contract->updateCache] Failed to fetch contract ID ${id}`);
      return;
    }

    const index = this.contracts.findIndex((c) => c.id === id);
    if (index >= 0) this.contracts.splice(index, 1);
    this.contracts.push(contract);
  }
}

module.exports = ContractManager;
