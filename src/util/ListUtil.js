const fetch = require('node-fetch');

const Util = require('./Util');

class ListUtil extends Util {
  /**
   * Updates server count in all bot lists
   */
  update() {
    this.updateBotsGg();
    this.updateTopGg();
  }

  /**
   * Updates server count for discord.bots.gg
   * @param {number} count Server count
   * @returns {Promise<void>}
   */
  async updateBotsGg() {
    const api = await this.client.apis.fetchKey('botsgg');
    if (!api) return null;

    const shards = this.client.ws.shards.keyArray();
    for (let i = 0; i < shards.length; i += 1) {
      const shard = shards[i];
      const count = this.client.guilds.cache.filter((g) => g.shardID === shard).size;
      await fetch(
        `https://discord.bots.gg/api/v1/bots/${this.client.user.id}/stats`,
        {
          headers: { Authorization: api.key, 'Content-Type': 'application/json' },
          body: { guildCount: count, shardCount: shards.length, shardId: shard },
        },
      )
        .then((r) => (r.ok
          ? this.client.logger.debug(`[list] Updated stats for shard ID ${shard} for discord.bots.gg (count: ${count})`)
          : this.client.logger.warn(`[list] HTTP ${r.status} returned from discord.bots.gg`)))
        .catch((error) => this.client.logger.error('[list] Error while trying to update stats for discord.bots.gg', error));
    }

    return null;
  }

  /**
   * Updates server count for top.gg
   * @param {number} count Server count
   * @returns {Promise<void>}
   */
  async updateTopGg() {
    const api = await this.client.apis.fetchKey('topgg');
    if (!api) return null;

    const shards = this.client.ws.shards.keyArray();
    for (let i = 0; i < shards.length; i += 1) {
      const shard = shards[i];
      const count = this.client.guilds.cache.filter((g) => g.shardID === shard).size;
      await fetch(
        `https://top.gg/api/bots/${this.client.user.id}/stats`,
        {
          headers: { Authorization: api.key, 'Content-Type': 'application/json' },
          body: { server_count: count, shard_count: shards.length, shard_id: shard },
        },
      )
        .then((r) => (r.ok
          ? this.client.logger.debug(`[list] Updated stats for shard ID ${shard} for top.gg (count: ${count})`)
          : this.client.logger.warn(`[list] HTTP ${r.status} returned from top.gg`)))
        .catch((error) => this.client.logger.error('[list] Error while trying to update stats for top.gg', error));
    }

    return null;
  }
}

module.exports = ListUtil;
