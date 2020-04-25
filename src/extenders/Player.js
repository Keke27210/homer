const { Player } = require('lavacord');

class CustomPlayer extends Player {
  constructor(node, id) {
    super(node, id);
    /**
     * Frequency of the broadcasted radio
     * @type {string}
     */
    this.frequency = null;

    /**
     * Refreshes of the embed
     * @type {number}
     */
    this.refreshes = 0;

    /**
     * Time this player was created at
     * @type {number}
     */
    this.start = Date.now();
  }

  /**
   * Sets frequency
   * @param {string} frequency
   */
  setFrequency(frequency) {
    this.frequency = frequency;
  }

  /**
   * Sets playing
   * @param {string} playing
   */
  setPlaying(playing) {
    // eslint-disable-next-line no-param-reassign
    if (typeof playing !== 'string') playing = '';
    const a = playing.split(' - ');
    for (let i = 0; i < a.length; i += 1) {
      if (a[i].length > 17) a[i] = a[i].match(/(.{1,17})(?:\s|$)/g);
    }
    this.playing = a.flat();
  }
}

module.exports = CustomPlayer;
