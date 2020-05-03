/* eslint-disable no-param-reassign */
const { Manager } = require('lavacord');
const fetch = require('node-fetch');

class LavacordManager extends Manager {
  constructor(client, nodes, options = {}) {
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

    /**
     * Whether the manager is ready to work
     * @type {boolean}
     */
    this.ready = false;

    // Set user and shard count once client is ready
    this.client.once('ready', async () => {
      this.user = this.client.user.id;
      this.shardCount = this.client.shard.count;
      if (nodes.length) {
        this.connect()
          .then(() => this.client.logger.log(`[lavacord] Connected successfully to ${this.idealNodes[0].host}:${this.idealNodes[0].port}`))
          .catch((error) => this.client.logger.error('[lavacord] Error while connecting to Lavalink', error));
        this.client.setInterval(this.clearPlayers.bind(this), (60 * 1000));
        this.ready = true;
      } else {
        this.client.logger.warn('[lavacord] No nodes were provided, disabled Lavacord and radio');
      }
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

  /**
   * Queries Lavalink for tracks
   * @param {string} query Query string
   * @returns {Promise<Track[]>}
   */
  getTracks(query) {
    const node = this.idealNodes[0];
    return fetch(`http://${node.host}:${node.port}/loadtracks?identifier=${encodeURIComponent(query)}`, { headers: { Authorization: node.password } })
      .then((r) => r.json())
      .then((data) => data.tracks);
  }

  /**
   * Destroys players no-one listen to
   * @returns {Promise<void>}
   */
  async clearPlayers() {
    const unlistened = Array.from(this.voiceStates.values())
      .filter((s) => this.client.channels.resolve(s.channel_id).members.size === 1);
    for (let i = 0; i < unlistened.length; i += 1) {
      const player = this.players.get(unlistened[i].guild_id);
      if (!player) continue;
      await player.destroy();
      await this.leave(unlistened[i].guild_id);
    }
  }
}

module.exports = LavacordManager;
