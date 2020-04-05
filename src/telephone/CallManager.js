const Manager = require('../managers/Manager');

const TABLE_COLUMNS = [
  // name - type - constraints - default value
  ['id', 'SERIAL', 'PRIMARY KEY', null],
  ['caller', 'INT', null, null],
  ['called', 'INT', null, null],
  ['state', 'INT', null, null],
  ['activity', 'TIMESTAMP', null, null],
  ['created', 'TIMESTAMP', null, null],
];

class CallManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Cached calls
     * @type {Call[]}
     */
    this.calls = [];
  }

  /**
   * Creates a "calls" table in the database if not exist
   */
  createTable() {
    if (!this.client.database.ready) return null;
    const columns = TABLE_COLUMNS.map((c) => `${c[0]} ${c[1]}${c[2] ? ` ${c[2]}` : ''}`).join(', ');
    return this.client.database.query(`CREATE TABLE IF NOT EXISTS calls (${columns})`)
      .catch((error) => {
        this.client.logger.error('[calls->createTable] Error while creating table', error);
      });
  }

  /**
   * Instantiate a call between two lines
   * @param {number} caller Caller contract
   * @param {number} called Called contract
   * @returns {Promise<null|string>} Null or error string
   */
  async createCall(caller, called) {
    const actives = await Promise.all([this.findCall(caller), this.findCall(called)]);
    if (actives[0] || actives[1]) {
      return 'busy';
    }

    const callerContract = await this.client.telephone.contractManager.fetchContract(null, caller)
      .catch((error) => {
        this.client.logger.error(`[calls->createCall] Error while fetching caller's contract no. ${caller}`, error);
        throw new Error('[calls->createCall] Cannot fetch caller\'s contract');
      });
    if (!callerContract || callerContract.state !== 1) {
      throw new Error(`[calls->createCall] Unknown caller's contract ${caller}`);
    }

    const calledContract = await this.client.telephone.contractManager.fetchContract(null, called)
      .catch((error) => {
        this.client.logger.error(`[calls->createCall] Error while fetching called's contract no. ${called}`, error);
        throw new Error('[calls->createCall] Cannot fetch called\'s contract');
      });
    if (!calledContract || calledContract.state !== 1) {
      throw new Error(`[calls->createCall] Unknown called's contract ${called}`);
    }


    await this.client.database.query(
      'INSERT INTO calls (caller, called, state, activity, created) VALUES ($1, $2, 0, $3, $3)',
      [caller, called, new Date()],
    )
      .catch((error) => {
        this.client.logger.error(`[calls->createCall] Error while creating call between ${caller} and ${called}`, error);
        throw new Error('[calls->createCall] Cannot instantiate call');
      });

    await this.notify(caller, 'telephone.call.outgoing', calledContract.line);
    await this.notify(called, 'telephone.call.incoming', callerContract.line, `${this.client.commandManager.prefixes[0]}pickup`);
    return null;
  }

  /**
   * Deletes a call
   * @param {number} id Call ID
   * @param {string} reason Translation key for reason
   * @returns {Promise<null|string>} Null or error string
   */
  async deleteCall(id, reason) {
    const call = await this.fetchCall(id);
    if (!call) {
      throw new Error(`[calls->deleteCall] Unable to find call no. ${id}`);
    }

    await this.client.database.query('UPDATE calls SET state = 3, activity = $1 WHERE id = $2', [new Date(), id])
      .then(() => {
        this.updateCache(id);
      })
      .catch((error) => {
        this.client.logger.error(`[calls->deleteCall] Error while ending call ID ${id}`, error);
        throw new Error('[calls->deleteCall] Unable to end call');
      });

    await this.notify(call.caller, `telephone.call.ended.${reason}`, 0);
    await this.notify(call.called, `telephone.call.ended.${reason}`, 1);

    return null;
  }

  /**
   * Fetches a call from its ID
   * @param {number} id Call ID
   * @returns {Promise<?Call>}
   */
  fetchCall(id) {
    return this.client.database.query('SELECT * FROM calls WHERE id = $1 AND state < 2', [id])
      .then((res) => {
        if (!res.rows[0]) return null;
        this.calls.push(res.rows[0]);
        return res.rows[0];
      });
  }

  /**
   * Find an active call involving the given line
   * @param {number} id Contract ID
   * @returns {Promise<?Call>}
   */
  findCall(id) {
    const cached = this.calls.find((c) => c.state < 2 && [c.caller, c.called].includes(id));
    if (cached) return cached;

    return this.client.database.query('SELECT * FROM calls WHERE (caller = $1 OR called = $1) AND state < 2', [id])
      .then((res) => {
        const call = res.rows[0];
        if (!call) return null;
        this.calls.push(call);
        return call;
      })
      .catch((error) => {
        this.client.logger.error('[calls->findCall] Error while finding call', error);
        throw new Error('[calls->findCalls] Error while finding call');
      });
  }

  /**
   * Pickup a call
   * @param {number} id Call ID
   */
  async pickupCall(id) {
    const call = await this.fetchCall(id);
    if (!call) {
      throw new Error(`[calls->pickupCall] Unknown call ID ${id}`);
    }

    await this.client.database.query('UPDATE calls SET state = 1, activity = $1 WHERE id = $2', [new Date(), id])
      .then(() => {
        this.updateCache(id);
      })
      .catch((error) => {
        this.client.logger.error(`[calls->findCall] Error while picking up call ID ${id}`, error);
        throw new Error('[calls->findCalls] Error while picking up call');
      });

    await this.notify(call.caller, 'telephone.call.pickup', 0);
    await this.notify(call.called, 'telephone.call.pickup', 1);
    return null;
  }

  /**
   * Handles a message
   * @param {Message} message Message to handle
   */
  async handleMessage(message) {
    if (message.author.bot) return;

    const contract = await this.client.telephone.contractManager.fetchContract(message.channel.id);
    if (!contract) return;

    const call = await this.findCall(contract.id);
    if (!call || call.state !== 1) return;

    const correspondent = await this.client.telephone.contractManager.fetchContract(
      null,
      contract.id === call.caller ? call.called : call.caller,
    );
    if (!correspondent) {
      this.deleteCall(call.id, 'error');
      return;
    }

    let content = message.cleanContent;
    const linkTest = content.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/igm);
    for (let i = 0; i < (linkTest || []).length; i += 1) {
      content = content.replace(linkTest[i], `<${linkTest[i]}>`);
    }

    const inviteTest = content.match(/discord(?:app\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/igm);
    for (let i = 0; i < (inviteTest || []).length; i += 1) {
      content = content.replace(inviteTest[i], `<${inviteTest[i]}>`);
    }

    await this.notify(correspondent.id, 'telephone.call.handler', message.author.tag, content);
  }

  /**
   * Notifies the given message to a channel's contract
   * @param {string} id Channel ID
   * @param  {string} key Translation key
   * @param {...any} args Translation arguments
   * @returns {Promise<Message>} Sent message
   */
  notify(id, key, ...args) {
    return this.client.telephone.contractManager.notify(id, key, ...args);
  }

  /**
  * Updates the cached version of a call
  * @param {number} id Call ID
  */
  async updateCache(id) {
    const index = this.calls.findIndex((c) => c.id === id);
    if (index >= 0) this.calls.splice(index, 1);

    const call = await this.client.database.query('SELECT * FROM calls WHERE id = $1', [id])
      .then((res) => res.rows[0] || null)
      .catch(() => null);
    if (!call) {
      this.client.logger.warn(`[calls->updateCache] Failed to fetch call ID ${id}`);
      return;
    }
    this.calls.push(call);
  }
}

module.exports = CallManager;
