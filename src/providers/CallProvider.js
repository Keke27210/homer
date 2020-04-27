const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'SERIAL', 'PRIMARY KEY'],
  ['caller', 'INT', 'NOT NULL'],
  ['called', 'INT', 'NOT NULL'],
  ['state', 'INT', 'NOT NULL'],
  ['updated', 'TIMESTAMP', null],
  ['created', 'TIMESTAMP', 'NOT NULL'],
];

class CallProvider extends Provider {
  constructor(client) {
    super(client, 'calls', TABLE_COLUMNS, false);

    /**
     * States for a call
     * @type {object}
     */
    this.states = {
      PENDING: 0,
      ONGOING: 1,
      TERMINATED: 2,
      ERROR: 4,
    };

    // Set listeners
    this.client.on('message', this.handleMessage.bind(this));
    this.client.on('typingStart', this.handleTyping.bind(this));
  }

  /**
   * Contract provider for this client
   * @type {ContractProvider}
   */
  get contracts() {
    return this.client.telephone.contracts;
  }

  /**
   * Creates a call
   * @param {number} caller Caller's contract ID
   * @param {number} called Called's contract ID
   * @returns {Promise<number>} Call ID
   */
  async createCall(caller, called) {
    const ongoing = await Promise.all([this.findCall(caller), this.findCall(called)]);
    if (ongoing[0]) throw new Error('CALLER_BUSY');
    if (ongoing[1]) throw new Error('CALLED_BUSY');

    const callerContract = await this.contracts.getRow(caller);
    if (!callerContract || callerContract.state !== this.contracts.states.ACTIVE) throw new Error('UNKNOWN_CALLER');

    const calledContract = await this.contracts.getRow(called);
    if (!calledContract || calledContract.state !== this.contracts.states.ACTIVE) throw new Error('UNKNOWN_CALLED');

    const id = await this.insertRow({
      caller,
      called,
      state: this.states.PENDING,
      created: new Date(),
    })
      .catch((error) => {
        this.client.logger.error(`[calls->createCall] Cannot create call between ${caller} and ${called}`, error);
        throw new Error('DATABASE_ERROR');
      });

    const callerMessage = await this.contracts.notify(caller, true, 'telephone.notifications.outgoing', calledContract.number);
    const calledMessage = await this.contracts.notify(called, true, 'telephone.notifications.incoming', callerContract.number);

    this.client.setTimeout(() => this.checkPicked(id, callerMessage.id, calledMessage.id), 30000);

    return id;
  }

  /**
   * Picks up a call
   * @param {number} id Call ID
   */
  async pickupCall(id) {
    const call = await this.getRow(id);
    if (!call) throw new Error('UNKNOWN_CALL');

    if (call.state > this.states.PENDING) throw new Error('ALREADY_PICKED');

    await this.updateRow(id, {
      state: this.states.ONGOING,
      updated: new Date(),
    });

    await this.contracts.notify(call.caller, true, 'telephone.notifications.pickedCaller');
    await this.contracts.notify(call.called, true, 'telephone.notifications.pickedCalled');

    this.client.setTimeout(() => this.checkPicked(id), 30000);

    return null;
  }

  /**
   * Terminates an ongoing call
   * @param {number} id Call ID
   * @param {'TERMINATED'|'ERROR'} type Termination type
   * @param {boolean} nomsg Do not send the terminated notification
   */
  async endCall(id, type, nomsg = false) {
    if (!this.states[type]) throw new Error('UNKNOWN_TYPE');

    const call = await this.getRow(id);
    if (!call) throw new Error('UNKNOWN_CALL');

    if (call.state > this.states.ONGOING) throw new Error('ALREADY_TERMINATED');

    await this.updateRow(id, {
      state: this.states[type],
      updated: new Date(),
    });

    if (!nomsg) {
      await this.contracts.notify(call.caller, true, 'telephone.notifications.terminated').catch(() => null);
      await this.contracts.notify(call.called, true, 'telephone.notifications.terminated').catch(() => null);
    }

    return null;
  }

  /**
   * Finds a call involving a contract
   * @param {number} contract Contract ID
   * @returns {Promise<?object>} Call
   */
  async findCall(contract) {
    const call = await this.getRows([
      ['state', '<', this.states.TERMINATED],
      [['caller', '=', contract], ['called', '=', contract]],
    ]);
    return call[0] || null;
  }

  /**
   * Handles a message
   * @param {Message} message Message instance
   */
  async handleMessage(message) {
    if (!this.database.ready || message.author.bot) return;

    const contract = await this.contracts.fetchContract(message.channel.id);
    if (!contract) return;

    const call = await this.findCall(contract.id);
    if (!call || call.state !== this.states.ONGOING) return;

    const correspondent = await this.contracts.getRow(call.caller === contract.id
      ? call.called
      : call.caller);
    if (!correspondent) return;
    if (correspondent.state > this.contracts.states.PAUSED) {
      this.endCall(correspondent.id, 'ERROR');
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

    const attachments = message.attachments
      .map((a) => `${message.dot} ${a.spoiler ? '||' : ''}**${a.name}** (**${Math.ceil(a.size / 1024)}**KB): <${a.url}>${a.spoiler ? '||' : ''}`)
      .join('\n');

    await this.contracts.notify(correspondent.id, false, `📞 ${message.author.tag}: ${content}${attachments ? `\n${attachments}` : ''}`);
    await this.updateRow(call.id, { updated: new Date() });
  }

  /**
   * Handles a typing event
   * @param {Channel} channel Channel
   * @param {User} user User
   */
  async handleTyping(channel, user) {
    if (user.id === this.client.user.id) return;

    const contract = await this.contracts.fetchContract(channel.id);
    if (!contract) return;

    const call = await this.findCall(contract.id);
    if (!call || call.state !== this.states.ONGOING) return;

    const correspondent = await this.contracts.getRow(call.caller === contract.id
      ? call.called
      : call.caller);
    if (!correspondent) return;

    this.startTyping(correspondent.channel);
    await this.updateRow(call.id, { updated: new Date() });
  }

  /**
   * Checks if a call was picked up, and ends it if not
   * @param {number} id Call ID
   * @param {string} caller Caller message ID
   * @param {string} called Called message ID
   */
  async checkPicked(id, caller, called) {
    const call = await this.getRow(id);
    if (!call) throw new Error('UNKNOWN_CALL');
    if (call.state !== this.states.PENDING) return;
    await this.endCall(id, 'TERMINATED', true);

    const callerContract = await this.contracts.getRow(call.caller);
    const calledContract = await this.contracts.getRow(call.called);
    if (!callerContract || !calledContract) return;

    const callerSettings = await this.client.settings.fetchSettings(callerContract.context);
    const calledSettings = await this.client.settings.fetchSettings(calledContract.context);
    if (!callerSettings || !calledSettings) return;

    const callerMessage = await this.fetchMessage(callerContract.channel, caller)
      .catch(() => null);
    if (callerMessage) {
      this.editMessage(callerContract.channel, caller, this.client.localeManager.translate(
        callerSettings.locale,
        'telephone.notifications.missed.caller',
        calledContract.number,
      ));
    }

    const calledMessage = await this.fetchMessage(calledContract.channel, called)
      .catch(() => null);
    if (calledMessage) {
      this.editMessage(calledContract.channel, called, this.client.localeManager.translate(
        calledSettings.locale,
        'telephone.notifications.missed.called',
        callerContract.number,
      ));
    }
  }

  /**
   * Executed every minute
   * Terminates every call where no-one talked the past minute
   */
  async minute() {
    const outdated = await this.getRows([
      ['state', '=', this.states.ONGOING],
      ['updated', '<', new Date(Date.now() - 60000).toISOString(), 'timestamp'],
    ]);
    for (let i = 0; i < outdated.length; i += 1) {
      await this.endCall(outdated[i].id, 'TERMINATED');
    }
  }

  /**
   * Informs users that their ongoing call will be disrupted during bot restart
   */
  async onShutdown() {
    const ongoing = await this.getRows([
      ['state', '<', this.states.TERMINATED],
    ]);
    for (let i = 0; i < ongoing.length; i += 1) {
      const { caller, called } = ongoing[i];
      await this.contracts.notify(caller, true, 'telephone.restart');
      await this.contracts.notify(called, true, 'telephone.restart');
    }
  }

  /**
   * Fetches a message from the Discord API
   * @param {string} channel Channel ID
   * @param {string} message Message ID
   * @returns {Promise<Message>}
   */
  fetchMessage(channel, message) {
    return this.client.api
      .channels[channel]
      .messages[message]
      .get();
  }

  /**
   * Edits a message
   * @param {string} channel Channel ID
   * @param {string} message Message ID
   * @param {string} content Content
   */
  editMessage(channel, message, content) {
    return this.client.api
      .channels[channel]
      .messages[message]
      .patch({
        data: { content },
      });
  }

  /**
   * Triggers typing indicator
   * @param {string} id Channel ID
   */
  startTyping(id) {
    return this.client.api
      .channels[id]
      .typing
      .post();
  }
}

module.exports = CallProvider;
