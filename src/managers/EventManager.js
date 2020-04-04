const { readdirSync } = require('fs');
const { resolve } = require('path');

const Manager = require('./Manager');

class EventManager extends Manager {
  constructor(client) {
    super(client);

    /**
     * Base directory for events
     * @type {string}
     */
    this.eventDirectory = resolve(this.srcDirectory, 'events');

    /**
     * Registered events
     * @type {Event[]}
     */
    this.events = [];
  }

  /**
   * Registers all available events into the client
   * @returns {number} Number of registered events
   */
  registerEvents() {
    let i = 0;
    const dirContent = readdirSync(this.eventDirectory);
    while (i < dirContent.length) {
      const event = new (require(resolve(this.eventDirectory, dirContent[i])))(this.client);
      this.events.push(event);
      this.client.on(event.name, event.handle.bind({ client: this.client, name: event.name }));
      i += 1;
    }
    return i;
  }

  /**
   * Unregisters events loaded in memory
   */
  unregisterEvents() {
    this.client.removeAllListeners();
    while (this.events.length) this.events.pop();
  }

  /**
   * Calls unregisterEvents() then registerEvents()
   * @returns {number} Number of registered events
   */
  reloadEvents() {
    this.unregisterEvents();
    return this.registerEvents();
  }
}

module.exports = EventManager;
