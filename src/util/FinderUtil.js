/* eslint-disable class-methods-use-this */
const Util = require('./Util');

const MENTION = /<(@!?|@&|#)(\d{17,20})>/g;
const TAG = /(.{0,30})#(\d{1,4})/g;
const ID = /(\d{17,20})/g;

class FinderUtil extends Util {
  async findMembers(message, query) {
    // 1- Testing mentions
    const mentions = MENTION.exec(query);
    MENTION.lastIndex = 0;

    if (mentions) {
      const member = await message.guild.members.fetch(mentions[2])
        .catch(() => null);
      if (member) return [member];
    }

    // 2- Testing IDs
    const ids = ID.exec(query);
    ID.lastIndex = 0;

    if (ids) {
      const member = await message.guild.members.fetch(ids[1])
        .catch(() => null);
      if (member) return [member];
    }

    // 3- Querying Discord
    // 3a- Extract username from tag if a tag was provided
    const tags = TAG.exec(query);
    TAG.lastIndex = 0;

    let search = query;
    if (tags) {
      [, search] = tags;
    }

    // 3b- Query Discord
    const results = await message.guild.members.fetch({ query: search, limit: 20 })
      .then((members) => {
        if (!tags) return members;
        return members.filter((m) => m.user.discriminator.startsWith(tags[2]));
      })
      .catch(this.client.logger.error);
    if (results && results.size) return results.array();


    // X- Return an empty array
    return null;
  }

  formatMembers(message, list, query) {
    let str = message._('finder.format.members', list.length, query);
    for (let i = 0; i < list.length; i += 1) {
      const member = list[i];
      str += `\n${message.dot} ${member.user.tag} (${member.id})`;
    }
    return str;
  }
}

module.exports = FinderUtil;
