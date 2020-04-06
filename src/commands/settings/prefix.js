const Command = require('../../structures/Command');

class PrefixCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'prefix',
      dm: true,
    });
  }

  async main(message, args) {
    const [prefix] = args;
    if (!prefix) {
      message.error(message._('prefix.none'));
      return 0;
    }

    if (prefix.length > this.client.settings.maxPrefixLength) {
      message.error(message._('prefix.length', this.client.settings.maxPrefixLength));
      return 0;
    }

    const ret = await this.client.settings.setPrefix(this.settings.id, prefix === 'disable' ? null : prefix)
      .then(() => {
        if (prefix === 'disable') {
          message.success(message._('prefix.disabled'));
        } else {
          message.success(message._('prefix.set', prefix));
        }
        return 0;
      })
      .catch(() => {
        message.error(message._('prefix.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = PrefixCommand;
