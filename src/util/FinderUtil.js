// Constants
const tagExpression = /(.{0,30})#(\d{4})/g;
const mentionExpression = /<(@!?|@&|#)(\d{17,20})>/g;
const idExpression = /(\d{17,20})/g;
const emojiExpression = /<a?:.{0,100}:(\d{17,20})>/g;

class FinderUtil {
  constructor(client) {
    this.client = client;
  }

  findMembers(members, query) {
    const userTagTest = tagExpression.exec(query); tagExpression.lastIndex = 0;
    const mentionTest = mentionExpression.exec(query); mentionExpression.lastIndex = 0;
    const idTest = idExpression.exec(query); idExpression.lastIndex = 0;

    if (userTagTest) {
      const username = userTagTest[1].toLowerCase();
      const discriminator = userTagTest[2];

      const foundMembers = members
        .filter(m => m.user.username.toLowerCase() === username
          && m.user.discriminator === discriminator);

      if (foundMembers.size > 0) return foundMembers;
    } else if (mentionTest) {
      if (members.has(mentionTest[2])) return [members.get(mentionTest[2])];
    } else if (idTest) {
      if (members.has(idTest[1])) return [members.get(idTest[1])];
    }

    const exact = [];
    const wrongCase = [];
    const startsWith = [];
    const includes = [];
    const lowerQuery = query.toLowerCase();

    members.forEach((member) => {
      const username = member.user.username;
      const displayName = member.displayName;

      if (username === query || displayName === query) {
        exact.push(member);
      } else if ((username.toLowerCase() === query || displayName.toLowerCase() === query) && exact.length === 0) {
        wrongCase.push(member);
      } else if ((username.toLowerCase().startsWith(lowerQuery) || displayName.toLowerCase().startsWith(lowerQuery)) && wrongCase.length === 0) {
        startsWith.push(member);
      } else if ((username.toLowerCase().includes(lowerQuery) || displayName.toLowerCase().includes(lowerQuery)) && startsWith.length === 0) {
        includes.push(member);
      }
    });

    if (exact.length > 0) return exact;
    if (wrongCase.length > 0) return wrongCase;
    if (startsWith.length > 0) return startsWith;
    return includes;
  }

  formatMembers(list, locale) {
    const message = [
      this.client.__(locale, 'finderUtil.formatMembers.title', { count: list.length }),
    ];

    for (let i = 0; (i < 6 && i < list.length); i += 1) {
      const member = list[i];
      message.push(`- **${member.user.username}**#${member.user.discriminator} (ID:${member.id})`);
    }

    if (list.length > 6) {
      message.push(this.client.__(locale, 'finderUtil.general.left', { count: (list.length - 6) }));
    }

    return message.join('\n');
  }

  findUsers(users, query) {
    const userTagTest = tagExpression.exec(query); tagExpression.lastIndex = 0;
    const mentionTest = mentionExpression.exec(query); mentionExpression.lastIndex = 0;
    const idTest = idExpression.exec(query); idExpression.lastIndex = 0;

    if (userTagTest) {
      const username = userTagTest[1].toLowerCase();
      const discriminator = userTagTest[2];

      const foundUsers = users.filter(u =>
        u.username.toLowerCase() === username &&
        u.discriminator === discriminator);

      if (foundMembers.size > 0) return foundUsers;
    } else if (mentionTest) {
      if (users.has(mentionTest[2])) return [users.get(mentionTest[2])];
    } else if (idTest) {
      if (users.has(idTest[1])) return [users.get(idTest[1])];
    }

    const exact = [];
    const wrongCase = [];
    const startsWith = [];
    const includes = [];
    const lowerQuery = query.toLowerCase();

    users.forEach((user) => {
      const username = user.username;

      if (username === query) {
        exact.push(user);
      } else if (username.toLowerCase() === query && exact.length === 0) {
        wrongCase.push(user);
      } else if (username.toLowerCase().startsWith(lowerQuery) && wrongCase.length === 0) {
        startsWith.push(user);
      } else if (username.toLowerCase().includes(lowerQuery) && startsWith.length === 0) {
        includes.push(user);
      }
    });

    if (exact.length > 0) return exact;
    if (wrongCase.length > 0) return wrongCase;
    if (startsWith.length > 0) return startsWith;
    return includes;
  }

  formatUsers(list, locale) {
    const message = [
      this.client.__(locale, 'finderUtil.formatUsers.title', { count: list.length }),
    ];

    for (let i = 0; (i < 6 && i < list.length); i += 1) {
      const user = list[i];
      message.push(`- **${user.username}**#${user.discriminator} (ID:${user.id})`);
    }

    if (list.length > 6) {
      message.push(this.client.__(locale, 'finderUtil.general.left', { count: (list.length - 6) }));
    }

    return message.join('\n');
  }

  findRolesOrChannels(list, query) {
    const idTest = idExpression.exec(query); idExpression.lastIndex = 0;
    const mentionTest = mentionExpression.exec(query); mentionExpression.lastIndex = 0;

    if (mentionTest) {
      return [list.get(mentionTest[2])];
    } if (idTest) {
      return [list.get(idTest[1])];
    }

    const exact = [];
    const wrongCase = [];
    const startsWith = [];
    const includes = [];
    const lowerQuery = query.toLowerCase();

    list.forEach((item) => {
      const name = item.name;
      if (name === '@everyone') return;

      if (name === query || name === query) {
        exact.push(item);
      } else if (name.toLowerCase() === query && exact.length === 0) {
        wrongCase.push(item);
      } else if (name.toLowerCase().startsWith(lowerQuery) && wrongCase.length === 0) {
        startsWith.push(item);
      } else if (name.toLowerCase().includes(lowerQuery) && startsWith.length === 0) {
        includes.push(item);
      }
    });

    if (exact.length > 0) return exact;
    if (wrongCase.length > 0) return wrongCase;
    if (startsWith.length > 0) return startsWith;
    return includes;
  }

  formatChannels(list, locale) {
    const message = [
      this.client.__(locale, 'finderUtil.formatChannels.title', { count: list.length }),
    ];

    for (let i = 0; (i < 6 && i < list.length); i += 1) {
      const channel = list[i];
      message.push(`- **${channel.name}** (ID:${channel.id})`);
    }

    if (list.length > 6) {
      message.push(this.client.__(locale, 'finderUtil.general.left', { count: (list.length - 6) }));
    }

    return message.join('\n');
  }

  formatRoles(list, locale) {
    const message = [
      this.client.__(locale, 'finderUtil.formatRoles.title', { count: list.length }),
    ];

    for (let i = 0; (i < 6 && i < list.length); i += 1) {
      const role = list[i];
      message.push(`- **${role.name}** (ID:${role.id})`);
    }

    if (list.length > 6) {
      message.push(this.client.__(locale, 'finderUtil.general.left', { count: (list.length - 6) }));
    }

    return message.join('\n');
  }

  async findEmojis(query) {
    const list = await this.client.shard.broadcastEval(`this.finder._emojiFind('${query}')`)
      .then(list => list.reduce((prev, val) => prev.concat(val)));
    return list || [];
  }

  _emojiFind(query) {
    const list = this.client.emojis.map(e => ({
      id: e.id,
      name: e.name,
      animated: e.animated,
      managed: e.managed,
      guild: e.guild ? e.guild.name : null,
    }));

    const emojiTest = emojiExpression.exec(query); emojiExpression.lastIndex = 0;
    if (emojiTest) {
      return [list.find(e => e.id === emojiTest[1])];
    }

    const exact = [];
    const wrongCase = [];
    const startsWith = [];
    const includes = [];
    const lowerQuery = query.toLowerCase();

    list.forEach((emoji) => {
      const name = emoji.name;
      const id = emoji.id;

      if (name === query || id === query) {
        exact.push(emoji);
      } else if (name.toLowerCase() === lowerQuery && exact.length === 0) {
        wrongCase.push(emoji);
      } else if (name.toLowerCase().startsWith(lowerQuery) && wrongCase.length === 0) {
        startsWith.push(emoji);
      } else if (name.toLowerCase().includes(lowerQuery) && startsWith.length === 0) {
        includes.push(emoji);
      }
    });

    if (exact.length > 0) return exact;
    if (wrongCase.length > 0) return wrongCase;
    if (startsWith.length > 0) return startsWith;
    return includes;
  }

  formatEmojis(list, locale) {
    const message = [
      this.client.__(locale, 'finderUtil.formatEmojis.title', { count: list.length }),
    ];

    for (let i = 0; (i < 6 && i < list.length); i += 1) {
      const emoji = list[i];
      message.push(`- <${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}> **${emoji.name}** (ID:${emoji.id})`);
    }

    if (list.length > 6) {
      message.push(this.client.__(locale, 'finderUtil.general.left', { count: (list.length - 6) }));
    }

    return message.join('\n');
  }
}

module.exports = FinderUtil;
