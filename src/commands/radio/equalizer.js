const Command = require('../../structures/Command');

class EqualizerCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'equalizer',
    });
  }

  async main(message, args) {
    const display = [];
  }
}

module.exports = EqualizerCommand;
