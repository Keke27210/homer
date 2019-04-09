const Event = require('../structures/Event');

class ErrorEvent extends Event {
  constructor(client) {
    super(client, 'error');
  }

  handle(error) {
    console.error(error.error);

    this.client.logger.error(`Client error:\r\n${typeof error.error === 'string' ? error.error : error.error.stack}`);
  }
}

module.exports = ErrorEvent;
