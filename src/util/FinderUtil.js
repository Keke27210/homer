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

    // 3- fetchAllMembers ? Seek in our cache : Querying Discord
    if (this.client.options.fetchAllMembers) {
      const found = message.guild.members.cache.filter(
        (m) => (`${m.user.username.toLowerCase()}#${m.user.discriminator}`.startsWith(query.toLowerCase())
          || m.nickname ? m.nickname.toLowerCase().startsWith(query.toLowerCase()) : false),
      );
      return found.array();
    }

    // 3a- Extract username from tag if a tag was provided
    const tags = TAG.exec(query);
    TAG.lastIndex = 0;

    let search = query;
    if (tags) {
      [, search] = tags;
    }

    // 3b- Query Discord
    const results = await message.guild.members.fetch({ query: search, limit: 20 })
      .catch(this.client.logger.error);
    if (results && results.size) {
      const found = results.find(
        (m) => (m.nickname ? m.nickname.toLowerCase() === search.toLowerCase() : false)
          || m.user.username.toLowerCase() === search.toLowerCase()
          || (tags ? m.user.discriminator.startsWith(tags[2]) : false),
      );
      if (found) return [found];
      return results.array();
    }


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

  findChannels(message, query, type) {
    let list = message.guild.channels.cache;
    if (type) list = list.filter((c) => c.type === type);

    // 1- Testing mentions
    const mentions = MENTION.exec(query);
    MENTION.lastIndex = 0;

    if (mentions) {
      const channel = list.get(mentions[2]);
      if (channel) return [channel];
    }

    // 2- Testing IDs
    const ids = ID.exec(query);
    ID.lastIndex = 0;

    if (ids) {
      const channel = list.get(ids[1]);
      if (channel) return [channel];
    }

    // 3- Querying by search
    const search = query.toLowerCase();
    const channel = list.find((c) => c.name.toLowerCase() === search);
    if (channel) return [channel];
    const channels = list.filter(
      (c) => c.name.toLowerCase().startsWith(search)
        || c.name.toLowerCase().includes(search),
    );
    if (channels.size) return channels.array();

    // X- Return an empty array
    return null;
  }

  formatChannels(message, list, query) {
    let str = message._('finder.format.channels', list.length, query);
    for (let i = 0; i < list.length; i += 1) {
      const channel = list[i];
      str += `\n${message.dot} **${channel.type === 'text' ? '#' : ''}${channel.name}** (${channel.id})`;
    }
    return str;
  }

  findRoles(message, query) {
    // 1- Testing mentions
    const mentions = MENTION.exec(query);
    MENTION.lastIndex = 0;

    if (mentions) {
      const role = message.guild.roles.resolve(mentions[2]);
      if (role && role.id !== message.guild.id) return [role];
    }

    // 2- Testing IDs
    const ids = ID.exec(query);
    ID.lastIndex = 0;

    if (ids) {
      const role = message.guild.roles.resolve(ids[1]);
      if (role) return [role];
    }

    // 3- Querying by search
    const search = query.toLowerCase();
    const role = message.guild.roles.cache.find((r) => r.name.toLowerCase() === search);
    if (role && role.id !== message.guild.id) return [role];
    const roles = message.guild.roles.cache.filter(
      (r) => r.id !== message.guild.id
        && (r.name.toLowerCase().startsWith(search)
        || r.name.toLowerCase().includes(search)),
    );
    if (roles.size) return roles.array();

    // X- Return an empty array
    return null;
  }

  formatRoles(message, list, query) {
    let str = message._('finder.format.roles', list.length, query);
    for (let i = 0; i < list.length; i += 1) {
      const role = list[i];
      str += `\n${message.dot} **${role.name}** (${role.id})`;
    }
    return str;
  }
}

module.exports = FinderUtil;
