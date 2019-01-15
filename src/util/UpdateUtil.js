const Util = require('./Util');
const request = require('superagent');
let radio = 0;

class UpdateUtil extends Util {
  constructor(client) {
    super(client);
  }

  async updateGame() {
    if (radio === 2) {
      radio = 0;
      const radios = await this.client.database.getDocuments('radios', true).then(radios => radios.map(r => `${r.name} (${r.id})`));
      return this.client.user.setActivity(`${radios[Math.floor(Math.random() * radios.length)]} on Homer Radio 📻`, { type: 'LISTENING' });
    } else {
      radio += 1;
      const game = await this.client.database.getDocument('bot', 'settings')
        .then(settings => settings.customGame) || 'Type {prefix}help! On {servers} servers on shard {shard}.';

      return this.client.user.setActivity(game
          .replace(/{prefix}/g, this.client.prefix)
          .replace(/{servers}/g, this.client.guilds.size)
          .replace(/{users}/g, this.client.users.size)
          .replace(/{shard}/g, this.client.shard.id)
          .replace(/{shards}/g, this.client.config.sharder.totalShards),
        { type: 'PLAYING' },
      );
    }
  }

  async updateBotList() {
    // DiscordBotList.com
    request
      .post(`https://discordbotlist.com/api/bots/${this.client.user.id}/stats`)
      .set('Authorization', this.client.config.botlist.discordBotsCom)
      .set('Content-Type', 'application/json')
      .send({
        shard_id: this.client.shard.id,
        guilds: this.client.guilds.size,
        users: this.client.users.size, // may be inaccurate since it only takes cached users into account
        voice_connections: this.client.voiceConnections.size,
      })
      .catch(() => null);

    // Discord Bots
    request
      .post(`https://discord.bots.gg/api/v1/bots/${this.client.user.id}/stats`)
      .set('Authorization', this.client.config.botlist.discordBotsGg)
      .set('Content-Type', 'application/json')
      .send({
        shardId: this.client.shard.id,
        shardCount: this.client.shard.count,
        guildCount: this.client.guilds.size,
      })
      .catch(() => null);

    // Discordbots.org
    request
      .post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`)
      .set('Authorization', this.client.config.botlist.discordBotsOrg)
      .set('Content-Type', 'application/json')
      .send({
        shard_id: this.client.shard.id,
        shard_count: this.client.shard.count,
        server_count: this.client.guilds.size,
      })
      .catch(() => null);

    // Listcord
    request
      .post(`https://listcord.com/api/bot/${this.client.user.id}/guilds`)
      .set('Authorization', this.client.config.botlist.listcord)
      .set('Content-Type', 'application/json')
      .send({
        shard: this.client.shard.id,
        guilds: this.client.guilds.size,
      })
      .catch(() => null);

    // SHARD 0 ONLY - DiscordBots.group
    if (this.client.shard.id === 0) {
      const total = await this.client.shard.fetchClientValues('guilds.size')
        .then(a => a.reduce((prev, val) => prev + val, 0))
        .catch(() => null);
      if (!total) return;

      request
        .post(`https://discordbots.group/api/bot/${this.client.user.id}`)
        .set('Authorization', this.client.config.botlist.discordbotsGroup)
        .set('Content-Type', 'application/json')
        .send({
          count: total,
        })
        .catch(() => null);
    }
  }
}

module.exports = UpdateUtil;
