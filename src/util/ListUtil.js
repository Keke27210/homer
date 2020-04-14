const fetch = require('node-fetch');
const wait = require('util').promisify(setTimeout);

const Util = require('./Util');

class ListUtil extends Util {
  /**
   * Updates server count in all bot lists
   */
  update() {
    this.updateBotsGg();
    this.updateTopGg();
    this.updateDADev();
  }

  /**
   * Updates server count for discord.bots.gg
   * @returns {Promise<void>}
   */
  async updateBotsGg() {
    const api = await this.client.apis.fetchKey('botsgg');
    if (!api) return null;

    const { id, count } = this.client.shard;
    const guilds = this.client.guilds.cache.filter((g) => g.shardID === shard).size;
    await fetch(
      `https://discord.bots.gg/api/v1/bots/${this.client.user.id}/stats`,
      {
        method: 'POST',
        headers: { Authorization: api.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildCount: guilds,
          shardCount: count,
          shardId: id,
        }),
      },
    )
      .then((r) => (r.ok
        ? this.client.logger.debug(`[list] Updated stats for shard ID ${shard} for discord.bots.gg (count: ${count})`)
        : this.client.logger.warn(`[list] HTTP ${r.status} returned from discord.bots.gg - Retry after: ${r.headers['retry-after'] || 'None'}`)))
      .catch((error) => this.client.logger.error('[list] Error while trying to update stats for discord.bots.gg', error));

    return null;
  }

  /**
   * Updates server count for top.gg
   * @returns {Promise<void>}
   */
  async updateTopGg() {
    const api = await this.client.apis.fetchKey('topgg');
    if (!api) return null;

    const { id, count } = this.client.shard;
    const guilds = this.client.guilds.cache.filter((g) => g.shardID === shard).size;
    await fetch(
      `https://top.gg/api/bots/${this.client.user.id}/stats`,
      {
        method: 'POST',
        headers: { Authorization: api.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_count: guilds,
          shard_count: count,
          shard_id: id,
        }),
      },
    )
      .then((r) => (r.ok
        ? this.client.logger.debug(`[list] Updated stats for shard ID ${shard} for top.gg (count: ${count})`)
        : this.client.logger.warn(`[list] HTTP ${r.status} returned from top.gg`)))
      .catch((error) => this.client.logger.error('[list] Error while trying to update stats for top.gg', error));

    return null;
  }

  /**
   * Updates server count for discordapps.dev
   * @returns {Promise<void>}
   */
  async updateDADev() {
    if (this.client.shard.id !== 0) return;

    const api = await this.client.apis.fetchKey('dadev');
    if (!api) return null;

    const count = await this.client.shard.fetchClientValues('guilds.cache.size')
      .then((c) => c.reduce((prev, val) => prev + val, 0));
    await fetch(
      `https://api.discordapps.dev/api/v2/bots/${this.client.user.id}`,
      {
        method: 'POST',
        headers: { Authorization: api.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot: { count },
        }),
      },
    )
      .then((r) => (r.ok
        ? this.client.logger.debug(`[list] Updated stats for discordapps.dev (count: ${count})`)
        : this.client.logger.warn(`[list] HTTP ${r.status} returned from discordapps.dev`)))
      .catch((error) => this.client.logger.error('[list] Error while trying to update stats for discordapps.dev', error));

    return null;
  }
}

module.exports = ListUtil;
