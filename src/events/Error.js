const Event = require('../structures/Event');

class ErrorEvent extends Event {
  constructor(client) {
    super(client, 'error');
  }

  handle(error) {
    console.error(error);
  }
}

module.exports = ErrorEvent;
