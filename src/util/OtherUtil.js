const Util = require('./Util');
const BigInt = require('big-integer');
const wait = require('util').promisify(setTimeout);

class OtherUtil extends Util {
  constructor(client) {
    super(client);
  }

  getShardID(id) {
    // (guild_id >> 22) % shard_count === shard_id (source: Discord Developers documentation)
    // We use big-integer because JS doesn't support natively 64-bit integers
    // Thanks to Danny from DAPI for the tip
    return new BigInt(id).shiftRight('22').mod(this.client.config.sharder.totalShards);
  }

  isDonator(id) {
    return this.client
      .guilds.get('382951433378594817')
      .roles.get('382967473135288320')
      .members.has(id);
  }

  async getBadges(id) {
    const owner = this.client.config.owners.includes(id);
    const donator = await this.client.database.getDocument('donators', id).then(a => (a ? true : false));
    const vip = await this.client.database.getDocument('vip', id).then(a => (a ? true : false));
    const nitro = await this.client.fetchUser(id)
      .then(u => u.avatar ? (u.avatar.startsWith('a_')) : false)
      .catch(() => false);

    const badges = [];
    if (owner) badges.push(this.client.constants.badges.owner);
    if (donator) badges.push(this.client.constants.badges.donator);
    if (vip) badges.push(this.client.constants.badges.vip);
    if (nitro) badges.push(this.client.constants.badges.nitro);

    return badges.join(' ');
  }

  async deleteSub(id) {
    const subscription = await this.client.database.getDocument('telephone', id);
    if (subscription) this.client.database.deleteDocument('telephone', id);
  }

  async processRSS() {
    const feeds = await this.client.database.getDocuments('rss', true);
    this.client.logger.info(`RSS: Processing ${feeds.length} feeds...`);

    for (const feed of feeds) {
      const language = await this.client.database.getDocument('settings', feed.settings).then(s => s ? s.misc.locale : 'en-gb');
      const parsed = await this.client.rss.parseURL(feed.url).catch(() => null);
      if (!parsed) return this.client.sendMessage(feed.channel, `${this.client.constants.emotes.warning} ${client.__(language, 'rss.update.error', { name: feed.name })}`);

      const pages = [];
      const entries = [];

      const filteredItems = parsed.items.filter(i => new Date(i.isoDate).getTime() > feed.used);
      for (const item of filteredItems) {
        pages.push({
          title: item.title,
          url: item.link,
          color: 'ORANGE',
          thumb: item.enclosure ? item.enclosure.url : undefined,
          footer: this.client.__(language, 'rss.update.footer', { total: filteredItems.length, i: (filteredItems.indexOf(item) + 1) }), time: new Date(item.isoDate),
        });

        entries.push((item.contentSnippet || item.content || this.client.__(language, 'rss.update.noContent')).slice(0, 2000));
      }

      if (entries.length === 0) {
        this.client.logger.info(`RSS: Feed ${feed.id} ignored: no new content`);
        continue;
      }

      this.client.menu.createMenu(
        feed.channel,
        'everyone',
        null,
        language,
        this.client.__(language, 'rss.update.main', { emote: this.client.constants.emotes.rss, name: feed.name }),
        pages,
        entries,
        { entriesPerPage: 1 },
      );

      this.client.database.updateDocument('rss', feed.id, { used: Date.now() });
      this.client.logger.info(`RSS: Feed ${feed.id} processed`);
    }
  }

  humanizePermissions(permissions, lang) {
    return permissions
      .filter(p => !this.client.constants.deprecatedPermissions.includes(p))
      .map(p => `\`${this.client.__(lang, `permission.${p}`)}\``)
      .join(', ') || this.client.__(lang, 'global.none');
  }

  ran() {
    const list = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    return list[Math.floor(Math.random() * list.length)];
  }

  generateNumber(id) {
    return `${id.substring(id.length - 3)}-${this.ran()}${this.ran()}${this.ran()}`;
  }

  // Code template from discord.js "resolveInviteCode" method
  resolveGiftCode(data) {
    const inviteRegex = /discord(?:app\.com\/gift|\.gift(?:\/gift)?)\/([\w-]{2,255})/i;
    const match = inviteRegex.exec(data);
    if (match && match[1]) return match[1];
    return data;
  }
}

module.exports = OtherUtil;
