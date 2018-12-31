const Event = require('../structures/Event');

class WarnError extends Event {
  constructor(client) {
    super(client, 'warn');
  }

  handle(warning) {
    console.warn(warning);

    this.client.logger.warn(`Client warn:\r\n${typeof warning === 'string' ? warning : warning.stack}`);
  }
}

module.exports = WarnError;
