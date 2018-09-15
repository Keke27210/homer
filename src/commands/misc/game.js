const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class GameCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'game',
      aliases: ['gameinfo'],
      category: 'misc',
      usage: '<game>',
      dm: true,
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let user = context.message.author;
    if (search && context.message.guild) {
      const foundMembers = this.client.finder.findMembers(context.message.guild.members, search);
      if (!foundMembers || foundMembers.length === 0) return context.replyError(context.__('finderUtil.findMembers.zeroResult', { search }));
      if (foundMembers.length === 1) user = foundMembers[0].user;
      else if (foundMembers.length > 1) return context.replyWarning(this.client.finder.formatMembers(foundMembers, context.settings.misc.locale));
    }

    const presence = this.client.presences.get(user.id);
    if (!presence || !presence.game) return context.replyWarning(context.__('game.noActiveGame', { user: `**${user.username}**#${user.discriminator}` }));

    if (presence.game.assets) {
      context.reply('Work in progress...');
    } else {
      let msg = context.__(`game.normalPlaying.${presence.game.type}`, {
        user: `**${user.username}**#${user.discriminator}`,
        game: presence.game.name,
        url: presence.game.url,
      });

      if (presence.game.timestamps.start) {
        msg += context.__('game.normalPlaying.for', {
          time: this.client.time.timeSince(new Date(presence.game.timestamps.start), context.settings.misc.locale),
        });
      } else {
        msg += '.';
      }

      context.reply(msg);
    }
  }
}

module.exports = GameCommand;
