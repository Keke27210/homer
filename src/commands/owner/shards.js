const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class ShardsCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'shards',
      dm: true,
      private: true,
    });

    /**
     * Statuses for a shard
     * @type {object}
     */
    this.status = {
      0: 'READY',
      1: 'CONNECTING',
      2: 'RECONNECTING',
      3: 'IDLE',
      4: 'NEARLY',
      5: 'DISCONNECTED',
      6: 'WAITING FOR GUILDS',
      7: 'IDENTIFYING',
      8: 'RESUMING',
    };
  }

  static getEmote(status) {
    let emote;
    switch (status) {
      case 0:
        emote = 'online';
        break;
      case 1:
      case 2:
      case 3:
      case 4:
        emote = 'idle';
        break;
      case 5:
        emote = 'offline';
        break;
      default:
        emote = 'dnd';
    }
    return emote;
  }

  async main(message) {
    const clusters = await this.client.shard.broadcastEval('({ shards: this.ws.shards.map((s, i) => ({ id: i, status: s.status, ping: s.ping })), guilds: this.guilds.cache.size })');

    const description = [];
    for (let i = 0; i < clusters.length; i += 1) {
      const cluster = clusters[i];
      const clDesc = [`${message.dot} Cluster #**${i}** (**${cluster.guilds}** guilds)`];
      for (let j = 0; j < cluster.shards.length; j += 1) {
        const shard = cluster.shards[j];
        clDesc.push(`${message.emote('placeholder')}${message.dot} Shard #**${shard.id}**: ${message.emote(this.getEmote(shard.status))} **${this.status[shard.status]}** - **${shard.ping}**ms`);
      }
      description.push(clDesc.join('\n'));
    }

    const embed = new MessageEmbed().setDescription(description.join('\n'));
    message.send('📡 Information about shards:', embed);
  }
}

module.exports = ShardsCommand;
