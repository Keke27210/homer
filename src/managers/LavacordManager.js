const { Manager } = require('lavacord');

class LavacordManager extends Manager {
  constructor(client, nodes, options = {}) {
    // eslint-disable-next-line no-param-reassign
    options.send = (packet) => {
      const guild = this.client.guilds.resolve(packet.d.guild_id);
      return client.ws.shards.get(guild.shardID).send(packet);
    };

    super(nodes, options);

    /**
     * Client that instantied this manager
     * @type {DiscordClient}
     */
    this.client = client;

    // Set user and shard count once client is ready
    this.client.once('ready', async () => {
      this.user = this.client.user.id;
      this.shardCount = this.client.shard.count;
      this.connect()
        .then(() => this.client.logger.log(`[lavacord] Connected successfully to ${this.idealNodes[0].host}:${this.idealNodes[0].port}`))
        .catch((error) => this.client.logger.error('[lavacord] Error while connecting to Lavalink', error));
    });

    // Handle voice updates
    this.client.ws
      .on('VOICE_SERVER_UPDATE', this.voiceServerUpdate.bind(this))
      .on('VOICE_STATE_UPDATE', this.voiceStateUpdate.bind(this))
      .on('GUILD_CREATE', async (guild) => {
        for (let i = 0; i < guild.voice_states.length; i += 1) {
          await this.voiceStateUpdate({ ...guild.voice_states[i], guild_id: guild.id });
        }
      });
  }
}

module.exports = LavacordManager;
