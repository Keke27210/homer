class Event {
  /**
   * @param {*} client Client that intantiated the event
   * @param {string} name Name of the event (discord.js)
   */
  constructor(client, name) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
    this.name = name;
  }
}

module.exports = Event;
