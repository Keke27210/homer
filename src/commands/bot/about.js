const Command = require('../../structures/Command');
const { RichEmbed, version } = require('discord.js');

class AboutCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'about',
      category: 'bot',
      dm: true,
    });
  }

  async execute(context) {
    const user = await this.client.fetchUser(this.client.config.owner);

    const aboutInformation = [
      context.__('about.embed.text'),
      '',
      `${this.dot} ${context.__('about.embed.owner')}: **${user.username}**#${user.discriminator}`,
      `${this.dot} ${context.__('about.embed.versions')}: **[Node.js](https://nodejs.org) ${process.version}** / **[discord.js](https://discord.js.org) v${version}**`,
      `${this.dot} ${context.__('about.embed.links')}: **[Homer - Support center](https://discord.gg/${this.client.config.misc.supportInvite})** / **[GitHub](${this.client.constants.githubLink})**`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(aboutInformation)
      .setThumbnail(this.client.user.avatar
        ? `https://cdn.discordapp.com/avatars/${this.client.user.id}/${this.client.user.avatar}.png`
        : this.getDefaultAvatar(this.client.user.discriminator));

    context.reply(
      context.__('about.title', { emote: this.client.constants.emotes.homer, name: `**${this.client.user.username}**` }),
      { embed },
    );
  }

  getDefaultAvatar(discriminator) {
    const defaultAvatarID = discriminator % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarID}.png`;
  }
}

module.exports = AboutCommand;
