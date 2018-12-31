const Event = require('../structures/Event');

class ErrorEvent extends Event {
  constructor(client) {
    super(client, 'error');
  }

  handle(error) {
    console.error(error);

    this.client.logger.error(`Client error:\r\n${typeof error === 'string' ? error : error.stack}`);
  }
}

module.exports = ErrorEvent;
