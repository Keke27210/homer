const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const { deconstruct } = require('../../../node_modules/discord.js/src/util/Snowflake');
const addEmote = '📥';

class EmoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'emote',
      dm: true,
    });
  }

  getURL(id, animated) {
    return `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`;
  }

  async execute(context) {
    const search = context.args.join(' ');
    let emoji = null;
    if (search) {
      const foundEmojis = await this.client.finder.findEmojis(search);
      if (!foundEmojis || foundEmojis.length === 0) return context.replyError(context.__('finderUtil.findEmojis.zeroResult', { search }));
      if (foundEmojis.length === 1) emoji = foundEmojis[0];
      else if (foundEmojis.length > 1) return context.replyWarning(this.client.finder.formatEmojis(foundEmojis, context.settings.misc.locale));
    } else {
      return context.replyError(context.__('emote.noQuery'));
    }

    let user = context.__('global.unknown');
    if (!emoji.managed && emoji.guildID) {
      const userReq = await this.client.rest.makeRequest('get', `/guilds/${emoji.guildID}/emojis/${emoji.id}`, true)
        .then(e => e.user)
        .catch(() => null);
      if (userReq) user = `**${userReq.username}**#${userReq.discriminator}`;
    }

    const emoteInformation = [
      `${this.dot} ${context.__('emote.embed.id')}: **${emoji.id}**`,
      `${this.dot} ${context.__('emote.embed.guild')}: ${emoji.guild ? `**${emoji.guild}**` : context.__('global.unknown')}`,
      `${this.dot} ${context.__('emote.embed.author')}: ${user}`,
      `${this.dot} ${context.__('emote.embed.animated')}: **${emoji.animated ? context.__('global.yes') : context.__('global.no')}**`,
      `${this.dot} ${context.__('emote.embed.managed')}: **${emoji.managed ? context.__('global.yes') : context.__('global.no')}**`,
      `${this.dot} ${context.__('emote.embed.creation')}: **${context.formatDate(deconstruct(emoji.id).timestamp)}**`,
      `${this.dot} ${context.__('emote.embed.url')}: **[${context.__('global.image')}](${this.getURL(emoji.id, emoji.animated)})**`,
    ].join('\n');

    const embed = new RichEmbed()
      .setDescription(emoteInformation)
      .setThumbnail(this.getURL(emoji.id, emoji.animated));

    if (context.message.guild &&
      context.message.member.permissions.has('MANAGE_EMOJIS') &&
      context.message.guild.me.permissions.has('MANAGE_EMOJIS')) {
      embed.setFooter(context.__('emote.embed.footer', { emote: addEmote }));
    }

    const message = await context.replySuccess(
      context.__('emote.title', { name: emoji.name }),
      { embed },
    );

    if (context.message.guild &&
        context.message.member.permissions.has('MANAGE_EMOJIS') &&
        context.message.guild.me.permissions.has('MANAGE_EMOJIS')) {
      await message.react(addEmote);
      message.awaitReactions(
        (reaction, user) => user.id === context.message.author.id && reaction.emoji.name === addEmote,
        { max: 1 },
      ).then(async () => {
        const newEmoji = await context.message.guild.createEmoji(
          this.getURL(emoji.id, emoji.animated),
          emoji.name,
          `Via emote commande by ${context.message.author.tag}`,
        );

        context.replySuccess(context.__('emote.added', {
          emote: `<${newEmoji.animated ? 'a' : ''}:${newEmoji.name}:${newEmoji.id}>`,
          name: context.message.guild.name,
        }));
      });
    }
  }
}

module.exports = EmoteCommand;
