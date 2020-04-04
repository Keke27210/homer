const fetch = require('node-fetch');

const Command = require('../structures/Command');

class GoogleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'google',
      dm: true,
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    if (!search) {
      message.error(message._('google.noSearch'));
      return 0;
    }

    const { googleCse, googleKey } = this.client.apiKeys;
    if (!googleCse || !googleKey) {
      message.warn(message._('google.unavailable'));
      return 1;
    }

    const m = await message.loading(message._('google.searching'));
    return fetch(`https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCse}&q=${encodeURIComponent(search)}&num=1`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.items || !data.items.length) {
          m.editWarn(message._('google.noResults', search));
          return 0;
        }

        m.edit(`🔍 **${message.author.username}**, ${data.items[0].link}`);
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[command->google] Search query: ${search}`, error);
        m.editError(message._('google.error'));
        return 1;
      });
  }
}

module.exports = GoogleCommand;
