const moment = require('moment-timezone');

const Util = require('./Util');

class LogUtil extends Util {
  constructor(client) {
    super(client);

    /**
     * Channel ID for guild logging
     * @type {?string}
     */
    this.guildLog = '705801324297715713';

    /**
     * Channel ID for command logging
     * @type {?string}
     */
    this.commandLog = '705801358577762394';

    this.client.on('guildCreate', this.onGuildCreate.bind(this));
    this.client.on('guildDelete', this.onGuildDelete.bind(this));
  }

  /**
   * Logs the specified message in a log channel
   * @param {string} type Channel type
   * @param {string} message Message to send
   * @returns {Promise<Message>}
   */
  log(type, message) {
    if (typeof this[type] !== 'string') throw new Error('INVALID_LOG_TYPE');
    const content = `\`[${moment().format('DD/MM/YYYY HH:mm:ss')}]\` ${message}`;
    return this.client.api
      .channels(this[type])
      .messages.post({ data: { content } })
      .catch((err) => {
        this.client.logger.warn(`[logUtil->log] Couldn't log in ${type} channel\n${err.message}`);
      });
  }

  /**
   * Executed when Homer is invited in a guild
   * @param {Guild} guild Guild Homer has joined
   * @returns {void}
   */
  onGuildCreate(guild) {
    this.log(
      'guildLog',
      `📥 Joined guild **${guild.name}** (${guild.id}) \`S${guild.shard.id}\` - **${guild.memberCount}** members - Created on **${moment(guild.createdTimestamp).format('DD/MM/YYYY HH:mm:ss')}**`,
    );
  }

  /**
   * Executed when Homer is kicked/leaves a guild
   * @param {Guild} guild Guild Homer has left
   * @returns {void}
   */
  onGuildDelete(guild) {
    this.log(
      'guildLog',
      `📤 Left guild **${guild.name}** (${guild.id}) \`S${guild.shard.id}\` - **${guild.memberCount}** members${guild.me ? ` - Joined on **${moment(guild.me.joinedTimestamp).format('DD/MM/YYYY HH:mm:ss')}**` : ''}`,
    );
  }
}

module.exports = LogUtil;
