const Routine = require('../structures/Routine');

class RadioRoutine extends Routine {
  constructor(client) {
    super(client);
  }

  async handle() {
    const inactives = Object.entries(this.client.radio.inactivity)
      .filter(([id, time]) => (Date.now() - time) > 300000)
      .map(([id]) => id);

    for (const inactive of inactives) {
      const voiceConnection = this.client.guilds.get(inactive).voiceConnection;
      if (!voiceConnection) continue;
      voiceConnection.disconnect();
      delete this.client.radio.inactivity[inactive];
    }
  }
}

module.exports = RadioRoutine;
