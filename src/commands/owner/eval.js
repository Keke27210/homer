/* eslint-disable class-methods-use-this */
const { inspect } = require('util');

const Command = require('../../structures/Command');

class EvalCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'eval',
      dm: true,
      private: true,
    });
  }

  async main(message, args) {
    const code = args.join(' ');

    let result;
    try {
      // eslint-disable-next-line no-eval
      result = await eval(code);
    } catch (e) {
      result = e;
    }

    if (typeof result !== 'string') result = inspect(result);
    result = result.replace(new RegExp(this.client.token, 'g'), '*TOKEN*');

    message.send(result, { code: 'js' })
      .catch((error) => message.send(error, { code: 'js' }));
  }
}

module.exports = EvalCommand;
