const Util = require('./Util');
const BigInt = require('big-integer');

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
