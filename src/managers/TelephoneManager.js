const Manager = require('./Manager');

class TelephoneManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Cached contracts
     * @type {Contract[]}
     */
    this.contracts = [];

    /**
     * State of Homer telephone
     * @type {boolean}
     */
    this.state = false;

    /**
     * Maximum active contracts per server or user
     * @type {number}
     */
    this.maxContracts = 2;

    /**
     * Time a server or a user must wait to subscribe again between 2 subscriptions
     * Current: 2 weeks
     * @type {number}
     */
    this.subscriptionDelay = (2 * 7 * 24 * 60 * 60 * 1000);

    /**
     * Time a server or a user must wait to subscribe again after a suspension
     * Current: 4 weeks
     * @type {number}
     */
    this.suspensionDelay = (4 * 7 * 24 * 60 * 60 * 1000);
  }

  createTable() {
    return this.client.database.query('CREATE TABLE contracts (id SERIAL PRIMARY KEY, context VARCHAR(20), channel VARCHAR(20), subscriber VARCHAR(20), line VARCHAR(7), active bool, state INT, edited DATE, created DATE)');
  }

  /**
   * Checks delays using context ID
   * @param {string} id Context ID
   */
  checkDelays(id) {
    return this.client.database.query('SELECT * FROM contracts WHERE context = $1', [id])
      .then((contracts) => {
        // Checking for suspended contracts
        const suspended = contracts.rows.filter((c) => c.state === 3
          && Date.now() - c.edited.getTime() < this.suspensionDelay);
        if (suspended.length) return 'suspended_contracts';

        // Checking for recent contracts
        const recent = contracts.rows.filter(
          (c) => Date.now() - c.created.getTime() < this.subscriptionDelay,
        );
        if (recent.length) return 'recent_contracts';

        // OK
        return 'OK';
      });
  }

  /**
   * Checks if the contract can be signed
   * @param {string} channel Channel ID
   * @param {string} subscriber User ID
   * @returns {Promise<string>} OK or rejection reason
   */
  async eligibility(channel, subscriber) {
    const userContracts = await this.checkDelays(subscriber);
    if (userContracts !== 'OK') return `user.${userContracts}`;

    const ch = this.client.channels.resolve(channel);
    if (ch && ch.guild) {
      const guildContracts = await this.checkDelays(ch.guild.id);
      if (guildContracts !== 'OK') return `guild.${guildContracts}`;
    }

    return 'OK';
  }

  /**
   * Fetches a contract
   * @param {string} channel Channel ID
   */
  fetchContract(channel) {
    const cached = this.contracts.find((c) => c.channel === channel);
    if (cached) return cached;

    return this.client.database.query('SELECT * FROM contracts WHERE channel = $1 AND state < 2', [channel])
      .then((res) => {
        const contract = res.rows[0];
        if (!contract) return null;
        this.contracts.push(contract);
        return contract;
      });
  }

  /**
   * Creates a pending contract
   * @param {string} context Context ID
   * @param {string} channel Channel ID
   * @param {string} subscriber Subscriber ID
   * @returns {Promise<number>} Contract no. (0 if error)
   */
  createContract(context, channel, subscriber) {
    return this.client.database.query('INSERT INTO contracts (context, channel, subscriber, line, active, state, edited, created) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
      context,
      channel,
      subscriber,
      'XXX-XXX',
      false,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
    ])
      .then(() => this.client.database.query('SELECT id FROM contracts WHERE context = $1 AND channel = $2 AND subscriber = $3 AND state = 0', [
        context, channel, subscriber,
      ])
        .then((res) => res.rows[0].id)
        .catch((error) => {
          this.client.logger.error('[telephone->createContract] Fetching newly created contract', error);
          return '?';
        }))
      .catch((error) => {
        this.client.logger.error(`[telephone->createContract] context: ${context} - channel: ${channel} - subscriber: ${subscriber}`, error);
        return 0;
      });
  }

  /**
   * Terminates a contract
   * @param {string} channel Channel ID
   * @returns {Promise<boolean>} Has the contract been terminated
   */
  terminateContract(channel) {
    return this.client.database.query('SELECT * FROM contracts WHERE channel = $1 AND state = 1', [channel])
      .then((res) => {
        const contract = res[0];
        if (!contract) return false;
        return this.client.database.query('DELETE FROM contracts WHERE id = $1', [contract[0]])
          .then(() => true)
          .catch((error) => {
            this.client.logger.error(`[telephone->terminateContract] delete operation on contract ${contract[0]}`, error);
            return false;
          });
      })
      .catch((error) => {
        this.client.logger.error(`[telephone->terminateContract] select operation on channel ${channel}`, error);
      });
  }
}

module.exports = TelephoneManager;

/**
 * @typedef {object} Contract
 * @param {string} id Contract ID
 * @param {string} context Context for settings (user or guild ID)
 * @param {string} channel Channel ID
 * @param {string} subscriber Subscriber ID
 * @param {string} line Line number
 * @param {boolean} active Active line
 * @param {number} state Line state (0: Pending, 1: Active, 2: Terminated, 3: Suspended, 4: Invalid)
 * @param {number} edited Last edit made to the contract (eg.: termination or suspension)
 * @param {number} created Creation date for this subscription
 */
