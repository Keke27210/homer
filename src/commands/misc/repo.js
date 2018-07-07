const Command = require('../../structures/Command');

class RepoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'repo',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    context.reply("Hey! I see you wanna see the source code of Homer, arent you? Here you can see the source code: https://github.com/iDroid27/homer");
  }
}

module.exports = RepoCommand;