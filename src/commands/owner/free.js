const Command = require('../../structures/Command');

class FreeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'free',
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const text = context.args.join(' ');
    if (!text) return context.replyError('You must provide a text to send.');

    const status = await this.client.other.ilAFreeIlAToutCompris(text);
    if (status === 200) {
      context.replySuccess('You have successfully sent a SMS to +3368844.. I won\'t give you my full number lmao');
    } else {
      context.replyError(this.errors[status] || this.errors.UNKNOWN)
    }
  }

  get errors() {
    return ({
      400: 'A required parameter has been forgotten in the request',
      402: 'You are being ratelimited by Free Mobile',
      403: 'The service has been disabled and/or the user/key combo is invalid',
      500: 'An internal server error has occured, please try again later',
      UNKNOWN: 'An unknown error has occured!',
    });
  }
}

module.exports = FreeCommand;
