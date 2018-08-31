const BigInt = require('big-integer');
const request = require('superagent');

class OtherUtil {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
  }

  getShardID(id) {
    // (guild_id >> 22) % shard_count === shard_id (source: Discord Developers documentation)
    // We use big-integer because JS doesn't support natively 64-bit integers
    // Thanks to Danny from DAPI for the tip
    return new BigInt(id).shiftRight('22').mod(this.client.config.sharder.totalShards);
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

  async updateShardStatus() {
    if (this.client.shardStatus === this.client.oldShardStatus) return;

    this.client.oldShardStatus = this.client.shardStatus;
    await this.client.updateMessage(
      this.client.config.statusChannel,
      this.client.config.status[`shard_${this.client.shard.id}`],
      `◻ Shard ${this.client.shard.id}: **${this.status[this.client.shardStatus]}** (**${this.client.unavailable.length}**/**${this.client.guilds.size}** unavailable guilds)`,
    );
  }

  async getRadio(id, url) {
    const b1 = this.client.voiceBroadcasts[id];
    if (b1) return b1;

    const b2 = this.client.createVoiceBroadcast();
    await b2.playStream(url, { bitrate: 64 });
    this.client.voiceBroadcasts[id] = b2;
    return b2;
  }

  async handleCleverbot(context) {
    const cleverbotState = await this.client.database.getDocument('bot', 'settings').then(s => s.cleverbot);
    const text = context.args.join(' ');
    if (!text || !cleverbotState) return;
    context.message.channel.startTyping(1);
    request
      .post('https://cleverbot.io/1.0/ask')
      .set({ 'Content-Type': 'application/json' })
      .send({
        user: this.client.config.api.cleverbotUser,
        key: this.client.config.api.cleverbotKey,
        text,
        nick: this.client.user.id,
      })
      .then((res) => {
        context.reply(res.body.response);
        context.message.channel.stopTyping();

        this.client.database.insertDocument('commandStats', {
          author: context.message.author.id,
          guild: context.message.guild ? context.message.guild.id : 'dm',
          command: 'cleverbot',
          question: text,
          answer: res.body.response,
          time: Date.now(),
        });
      })
      .catch((res) => { context.replyError(`ERROR: \`${res.body ? res.body.status : 'UNKNOWN'}\``); context.message.channel.stopTyping(true); });
  }

  get status() {
    return ({
      online: `${this.client.constants.status.online} Online`,
      reconnecting: `${this.client.constants.status.idle} Reconnecting`,
      maintenance: `${this.client.constants.status.dnd} Maintenance`,
      offline: `${this.client.constants.status.offline} Offline`,
    });
  }
}

module.exports = OtherUtil;
