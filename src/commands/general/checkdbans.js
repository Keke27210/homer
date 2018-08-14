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
      .post('https://bans.discordlist.net/api')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        version: 3,
        userid: user.id,
        token: this.client.config.api.discordBans,
      })
      .then((response) => {
        const body = response.body.toString();
        const object = (body === 'False' ? null : JSON.parse(body));

        const banInformation = [
          `${this.dot} ${context.__('checkdbans.embed.listed')}: **${body === 'False' ? context.__('global.no') : context.__('global.yes')}**`,
        ];

        if (object) {
          const link = this.getLink(object[4]);
          banInformation.push(
            `${this.dot} ${context.__('checkdbans.embed.reason')}: **${object[3]}**`,
            `${this.dot} ${context.__('checkdbans.embed.proof')}: **[${context.__('global.image')}](${link})**`,
          );
        }

        const embed = new RichEmbed()
          .setDescription(banInformation.join('\n'))
          .setColor(body === 'False' ? 0x00FF00 : 0xFF0000)
          .setThumbnail(user.displayAvatarURL);

        message.edit(
          context.__('checkdbans.title', { emote: this.client.constants.emotes.dbans, name: `**${user.username}**#${user.discriminator}` }),
          { embed },
        );
      })
      .catch(() => {
        message.edit(`${this.client.constants.emotes.error} ${context.__('checkdbans.error')}`);
      });
  }

  getLink(string) {
    const linkExpression = /<a href="(.*)">.*<\/a>/g.exec(string);
    return linkExpression ? linkExpression[1] : 'UNAVAILABLE';
  }
}

module.exports = CheckdbansCommand;
