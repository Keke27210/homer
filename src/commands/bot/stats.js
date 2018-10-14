const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class StatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      category: 'bot',
      dm: true,
    });
  }

  async execute(context) {
    const [serverCount, memoryUsage, shardCount, broadcastCount] = await this.client.shard.broadcastEval('({ server: this.guilds.size, memory: process.memoryUsage().heapUsed, broadcasts: this.voiceConnections.size })')
      .then((shardsInfo) => {
        const serverCount = shardsInfo
          .map(s => s.server)
          .reduce((prev, val) => prev + val, 0);

        const memoryUsage = shardsInfo
          .map(s => s.memory)
          .reduce((prev, val) => prev + val, 0);

        const broadcastCount = shardsInfo
          .map(s => s.broadcasts)
          .reduce((prev, val) => prev + val, 0);

        return [serverCount, memoryUsage, shardsInfo.length, broadcastCount];
      });

    const currentCalls = await this.client.database.provider.table('calls').count();
    const commandsRan = await this.client.database.provider.table('commandStats').count();
    const statsInformation = [
      `${this.dot} ${context.__('stats.embed.shards')}: **${shardCount}**`,
      `${this.dot} ${context.__('stats.embed.servers')}: **${serverCount}**`,
      `${this.dot} ${context.__('stats.embed.uptime')}: ${this.client.time.timeSince(this.client.readyTimestamp, context.settings.misc.locale, true)}`,
      `${this.dot} ${context.__('stats.embed.memory')}: **${Math.floor(memoryUsage / 1024 / 1024)}**MB`,
      `${this.dot} ${context.__('stats.embed.commands')}: ${context.__('stats.embed.commandsValue', {
        count: commandsRan,
        date: context.formatDate(1527804000), // June 1st 2018 00:00:00 UTC
      })}`,
      `${this.dot} ${context.__('stats.embed.currentCalls')}: **${currentCalls}**`,
      `${this.dot} ${context.__('stats.embed.currentBroadcasts')}: **${broadcastCount}**`,
    ];

    const embed = new RichEmbed()
      .setDescription(statsInformation.join('\n'))
      .setThumbnail(`https://cdn.discordapp.com/avatars/${this.client.user.id}/${this.client.user.avatar}`);

    context.reply(
      context.__('stats.title', { name: this.client.user.username }),
      { embed },
    );
  }
}

module.exports = StatsCommand;
