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
      context.reply(context.__(`game.normalPlaying.${Boolean(presence.game.timestamps)}`, {
        emote: this.emotes[presence.game.type],
        user: `**${user.username}**#${user.discriminator}`,
        action: context.__(`game.type.${presence.game.type}`),
        game: presence.game.type === 1 ? `**${presence.game.name}** (<${presence.game.url}>)` : `**${presence.game.name}**`,
        time: (presence.game.timestamps && presence.game.timestamps.start) ? this.client.time.timeSince(presence.game.timestamps.start, context.settings.misc.locale) : null,
      }));
    }
  }
}

module.exports = GameCommand;
