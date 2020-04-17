const { MessageEmbed, version: djs } = require('discord.js');
const { name, version } = require('../../../package.json');

const Command = require('../../structures/Command');

class AboutCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'about',
      dm: true,
    });
  }

  async main(message) {
    const owners = [];
    for (let i = 0; i < this.client.owners.length; i += 1) {
      const user = await this.client.users.fetch(this.client.owners[i])
        .catch(() => null);
      if (user) owners.push(user.tag);
    }

    const description = [
      `${message.dot} ${message._('about.developers')}: ${owners.join(', ')}`,
      `${message.dot} ${message._('about.guilds')}: **${this.client.guilds.cache.size}** (${message._('about.shard', message.guild ? (message.guild.shardID + 1) : 1)})`,
      `${message.dot} ${message._('about.memory')}: **${Math.round(process.memoryUsage().rss / 1024 / 1024)}**MB`,
      `${message.dot} ${message._('about.versions')}: ${name} **${version}** / node **${process.version}** / discord.js **${djs}**`,
      `${message.dot} ${message._('about.links')}: **[GitHub](https://github.com/Keke27210/homer)** / **[Homer - Support server](${this.client.invite})**`,
    ].join('\n');

    const embed = new MessageEmbed()
      .setDescription(description)
      .setThumbnail(this.client.user.avatarURL({ size: 128 }));

    message.send(message._('about.title', message.emote('homer'), this.client.user.username), embed);
  }
}

module.exports = AboutCommand;
