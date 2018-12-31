const Util = require('./Util');
const { RichEmbed } = require('discord.js');

class HandlerUtil extends Util {
  constructor(client) {
    super(client);
  }

  async remind(job) {
    const user = await this.client.fetchUser(job.user)
      .catch(() => null);
    if (!user) return;
    const settings = await this.client.database.getDocument('settings', user.id)
      || this.client.constants.defaultUserSettings(user.id);

    user.send(this.client.__(settings.misc.locale, 'handler.remind', {
      text: job.text,
      set: this.client.time.timeSince(job.start, settings.misc.locale, false, true),
    }));
  }

  async poll(job) {
    const settings = await this.client.database.getDocument('settings', job.guild)
      || this.client.constants.defaultGuildSettings(job.guild);

    const channel = this.client.channels.get(job.channelID);
    if (!channel) return;
    const message = await channel.fetchMessage(job.messageID);

    let reactions = [];
    message.reactions.forEach((reaction) => {
      if (job.strict && !job.emotes.includes(reaction.emoji.identifier)) return;

      reactions.push({
        emoji: reaction.emoji,
        count: reaction.me ? (reaction.count - 1) : reaction.count,
      });
    });

    if (reactions.length === 0) return;

    let totalVotes = 0;
    for (let i = 0; i < reactions.length; i += 1) {
      const reaction = reactions[i];
      if (/.*:\d{17,20}/.test(reaction.emoji)) {
        reactions[i].emoji = `<:${reaction.emoji}>`;
      }

      totalVotes += reaction.count;
    }

    reactions = reactions.sort((a, b) => b.count - a.count);
    const max = reactions[0].count;
    const winners = reactions.filter(r => r.count === max);

    const embed = new RichEmbed().setTitle(job.title);
    if (job.color) embed.setColor(job.color);

    const winMsg = winners.length > 1
      ? this.client.__(settings.misc.locale, 'handler.poll.tie', { count: max })
      : this.client.__(settings.misc.locale, 'handler.poll.one', { count: max });
    embed.setDescription(`${winMsg}\n\n${winners.map(r => r.emoji).join(' ')}`);

    channel.send({ embed });
  }
}

module.exports = HandlerUtil;
