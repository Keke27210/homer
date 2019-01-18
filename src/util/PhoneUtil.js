const Util = require('./Util');

class PhoneUtil extends Util {
  constructor(client) {
    super(client);
  }

  async getStatus(id) {
    const calls = await this.client.database.getDocuments('calls', true);
    if (calls.length === 0) return 0;

    return calls.find((call) => {
      if (call.type === 0) return call.sender.id === id || call.receiver.id === id;
      else call.receivers.find(r => r.id === id);
    }) ? 1 : 0;
  }
}

module.exports = PhoneUtil;
