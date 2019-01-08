const Event = require('../structures/Event');

class DisconnectEvent extends Event {
  constructor(client) {
    super(client, 'disconnect');
  }

  handle(closeEvent) {
    this.client.logger.warn(`Disconnected - WS Code: ${closeEvent.code || '?'}`);

    if (this.client.debug) {
      this.client.shard.send({
        type: 'log',
        message: `DISCONNECT: WS CODE ${closeEvent.code || '?'}`,
      });
    }
  }
}

module.exports = DisconnectEvent;
