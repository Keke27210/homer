const { RichEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const Command = require('../../structures/Command');

class CheckdbansCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'checkdbans',
      aliases: ['dbans'],
      usage: '[user]',
      category: 'general',
      dm: true,
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let user = context.message.author;
    if (isNaN(search) && context.message.guild) {
      const foundMembers = this.client.finder.findMembers(context.message.guild.members, search);
      if (!foundMembers || foundMembers.length === 0) return context.replyError(context.__('finderUtil.findMembers.zeroResult', { search }));
      if (foundMembers.length === 1) user = foundMembers[0].user;
      else if (foundMembers.length > 1) return context.replyWarning(this.client.finder.formatMembers(foundMembers, context.settings.misc.locale));
    } else if (search) {
      user = await this.client.fetchUser(search)
        .catch(() => {});
    }
    if (!user) return context.replyWarning(context.__('checkdbans.notFound', { search }));

    const message = await context.replyLoading(context.__('global.loading'));
    snekfetch
      .post(`https://bans.discord.id/api/check.php?user_id=${user.id}`)
      .set('Authorization', this.client.config.api.discordBans)
      .then((response) => {
        const obj = JSON.parse(response.text);
        let banned = obj.banned === '0' ? false : true;

        const banInformation = [
          `${this.dot} ${context.__('checkdbans.embed.listed')}: **${banned ? context.__('global.yes') : context.__('global.no')}**`,
        ];

        if (banned) {
          banInformation.push(
            `${this.dot} ${context.__('checkdbans.embed.reason')}: **${obj.reason}**`,
            `${this.dot} **[${context.__('checkdbans.embed.proof')}](${obj.proof})**`,
          );
        }

        const embed = new RichEmbed()
          .setDescription(banInformation.join('\n'))
          .setColor(banned ? 0xFF0000 : 0x00FF00)
          .setThumbnail(user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
            : this.getDefaultAvatar(user.discriminator));
        if (banned) embed.setFooter(`ID: ${obj.case_id}`);

        message.edit(
          context.__('checkdbans.title', { emote: this.client.constants.emotes.dbans, name: `**${user.username}**#${user.discriminator}` }),
          { embed },
        );
      })
      .catch(() => {
        message.edit(`${this.client.constants.emotes.error} ${context.__('checkdbans.error')}`);
      });
  }

  getDefaultAvatar(discriminator) {
    const defaultAvatarID = discriminator % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarID}.png`;
  }
}

module.exports = CheckdbansCommand;
