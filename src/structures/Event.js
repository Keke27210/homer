class Event {
  constructor(client, name) {
    /**
     * Client that instantied this event
     * @type {DiscordClient}
     */
    this.client = client;

    /**
     * discord.js name for this event
     * @type {string}
     */
    this.name = name;
  }

  /**
   * Default handle function (must be replaced with a custom one)
   */
  handle() {
    this.client.logger.warn(`[event->${this.name}] no custom handle function`);
  }
}

module.exports = Event;
