/* eslint-disable class-methods-use-this */
const Util = require('./Util');

const MENTION = /<(@!?|@&|#)(\d{17,20})>/g;
const ID = /(\d{17,20})/g;

class FinderUtil extends Util {
  async findMembers(message, query) {
    // 0- Testing mentions
    const mentions = MENTION.exec(query);
    MENTION.lastIndex = 0;

    if (mentions) {
      const member = await message.guild.members.fetch(mentions[2], { withPresences: true })
        .catch(() => null);
      if (member) return [member];
    }

    // 1- Testing IDs
    const ids = ID.exec(query);
    ID.lastIndex = 0;

    if (ids) {
      const member = await message.guild.members.fetch(ids[2], { withPresences: true })
        .catch(() => null);
      if (member) return [member];
    }

    // X- Return an empty array
    return [];
  }
}

module.exports = FinderUtil;
