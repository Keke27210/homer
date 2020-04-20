const { Player } = require('lavacord');

class CustomPlayer extends Player {
  constructor(node, id, radio) {
    super(node, id);

    /**
     * ID of the radio being broadcasted
     * @type {number}
     */
    this.radio = radio;
  }
}

module.exports = CustomPlayer;
