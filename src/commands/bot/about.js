const { version: djs } = require('discord.js');
const { version } = require('../../../package.json');

const Command = require('../../structures/Command');

class AboutCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'about',
      dm: true,
    });
  }

  async main(message) {
    const { owners } = this.client;
    for (let i = 0; i < owners.length; i += 1) {
      const user = await this.client.users.fetch(owners[i])
        .catch(() => null);
      if (user) owners[i] = user.tag;
    }

    const description = [
      `${message.dot} ${message._('about.developers')}: ${owners.join(', ')}`,
      `${message.dot} ${message._('about.version')}: **${version}**`,
      `${message.dot} ${message._('about.node')}: **${process.version}**`,
      `${message.dot} ${message._('about.djs')}: **${djs}**`,
    ].join('\n');

    const embed = message.getEmbed()
      .setDescription(description)
      .setThumbnail(this.client.user.avatarURL({ size: 128 }));

    message.send(message._('about.title', message.eBot, this.client.user.username), embed);
  }
}

module.exports = AboutCommand;
