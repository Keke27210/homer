/* eslint-disable class-methods-use-this */
const Command = require('../structures/Command');

class EvalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      private: true,
    });
  }

  async main(message, args) {
    const code = args.join(' ');
    if (!code) {
      message.channel.send('❌ You must provide code to execute.');
      return 0;
    }

    const result = await eval(code);
    if (result) {
      if (result.length > 1990) {
        message.channel.send('⚠️ Output too long!');
      } else {
        message.channel.send(require('util').format(result), { code: true });
      }
    } else {
      message.channel.send('⚠️ No output');
    }

    return 0;
  }
}

module.exports = EvalCommand;
