const Command = require('../../structures/Command');

class TuneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tune',
      category: 'misc',
      hidden: true,
    });
  }

  async execute(context) {
    const tuneCommand = this.client.commands.getCommand('radio').children.find(c => c.name === 'tune');
    tuneCommand.execute(context);
  }
}

module.exports = TuneCommand;
