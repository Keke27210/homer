const Routine = require('../structures/Routine');
const request = require('superagent');

class BotlistRoutine extends Routine {
  constructor(client) {
    super(client);
  }

  async handle() {
    if (new Date().getUTCMinutes() !== 30) return; // Only update at xx:30
    const keys = await this.client.database.getDocument('bot', 'botlist');

    // DiscordBotList.com
    request
      .post(`https://discordbotlist.com/api/bots/${this.client.user.id}/stats`)
      .set('Authorization', `Bot ${keys.discordBotsListCom}`)
      .set('Content-Type', 'application/json')
      .send({
        shard_id: this.client.shard.id,
        guilds: this.client.guilds.size,
        users: this.client.users.size, // may be inaccurate since it only takes cached users into account
        voice_connections: this.client.voiceConnections.size,
      })
      .then(() => this.client.logger.info('Updated botlist "discordbotlist.com"'))
      .catch(r => this.client.logger.error(`Unable to update botlist "discordbotlist.com" (${r.status || '?'})`));

    // Discord Bots
    request
      .post(`https://discord.bots.gg/api/v1/bots/${this.client.user.id}/stats`)
      .set('Authorization', keys.discordBotsGg)
      .set('Content-Type', 'application/json')
      .send({
        shardId: this.client.shard.id,
        shardCount: this.client.shard.count,
        guildCount: this.client.guilds.size,
      })
      .then(() => this.client.logger.info('Updated botlist "discord.bots.gg"'))
      .catch(r => this.client.logger.error(`Unable to update botlist "discord.bots.gg" (${r.status || '?'})`));

    // Discordbots.org
    request
      .post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`)
      .set('Authorization', keys.discordBotsOrg)
      .set('Content-Type', 'application/json')
      .send({
        shard_id: this.client.shard.id,
        shard_count: this.client.shard.count,
        server_count: this.client.guilds.size,
      })
      .then(() => this.client.logger.info('Updated botlist "discordbots.org"'))
      .catch(r => this.client.logger.error(`Unable to update botlist "discordbots.org" (${r.status || '?'})`));

    // Listcord
    /*request
      .post(`https://listcord.com/api/bot/${this.client.user.id}/guilds`)
      .set('Authorization', keys.listcord)
      .set('Content-Type', 'application/json')
      .send({
        shard: this.client.shard.id,
        guilds: this.client.guilds.size,
      })
      .then(() => this.client.logger.info('Updated botlist "listcord.com"'))
      .catch(r => this.client.logger.error(`Unable to update botlist "listcord.com" (${r.status || '?'})`));*/

    // SHARD 0 ONLY
    if (this.client.shard.id === 0) {
      const total = await this.client.shard.fetchClientValues('guilds.size')
        .then(a => a.reduce((prev, val) => prev + val, 0))
        .catch(() => null);
      if (!total) return;

      // DiscordBots.group
      request
        .post(`https://discordbots.group/api/bot/${this.client.user.id}`)
        .set('Authorization', keys.discordbotsGroup)
        .set('Content-Type', 'application/json')
        .send({
          count: total,
        })
        .then(() => this.client.logger.info('Updated botlist "discordbots.group"'))
        .catch(r => this.client.logger.error(`Unable to update botlist "discordbots.group" (${r.status || '?'})`));

      // BotsForDiscord.com
      request
        .post(`https://botsfordiscord.com/api/bot/${this.client.user.id}`)
        .set('Authorization', keys.botsForDiscord)
        .set('Content-Type', 'application/json')
        .send({
          server_count: total,
        })
        .then(() => this.client.logger.info('Updated botlist "botsfordiscord.com"'))
        .catch(r => this.client.logger.error(`Unable to update botlist "botsfordiscord.com" (${r.status || '?'})`));
    }
  }
}

module.exports = BotlistRoutine;
