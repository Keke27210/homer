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

  get emotes() {
    return ['🎮', this.client.constants.status.streaming, '🎵', '📺'];
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

    const presence = user.presence;
    if (!presence || !presence.game) return context.replyWarning(context.__('game.noActiveGame', { user: `**${user.username}**#${user.discriminator}` }));

    let embed;
    if (presence.game.assets) {
      const description = [];
      description.push(`**${presence.game.name}**`);
      if (presence.game.details) description.push(presence.game.details);
      if (presence.game.state) description.push(`${presence.game.state}${presence.game.party && presence.game.party.size ? ` (${presence.game.party.size[0]}/${presence.game.party.size[1]})` : ''}`);
      if (presence.game.timestamps && presence.game.timestamps.end) description.push('\n' + context.__('game.embed.ends', { time: this.client.time.timeSince(new Date(presence.game.timestamps.end).getTime(), context.settings.misc.locale) }));

      embed = new RichEmbed()
        .setDescription(description.join('\n'))
        .setThumbnail(presence.game.assets.largeImageURL || presence.game.assets.smallImageURL);
    }

    context.reply(context.__(`game.normalPlaying.${Boolean(presence.game.timestamps)}`, {
      emote: this.emotes[presence.game.type],
      user: `**${user.username}**#${user.discriminator}`,
      action: context.__(`game.type.${presence.game.type}`),
      game: presence.game.type === 1 ? `**${escape(presence.game.name)}** (<${presence.game.url}>)` : `**${escape(presence.game.name)}**`,
      time: (presence.game.timestamps && presence.game.timestamps.start) ? this.client.time.timeSince(presence.game.timestamps.start.getYear() === 70 ? (presence.game.timestamps.start * 1000) : presence.game.timestamps.start, context.settings.misc.locale) : null,
    }), { embed });
  }
}

function escape(game) {
  return game
    .replace(/<@(\d{17,19})>/g, 'UID:$1')
    .replace(/<@&(\d{17,19})>/g, 'RID:$1')
    .replace(/@everyone|@here/g, 'AT_EVERYONE');
}

module.exports = GameCommand;
