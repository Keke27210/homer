const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class ShardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shards',
      category: 'owner',
      dm: true,
      hidden: true,
      private: true,
    });
  }

  async execute(context) {
    const values = await this.client.shard.broadcastEval('this ? ({ ping: this.ping, status: this.status, guilds: this.guilds.size, users: this.users.size }) : null')
      .catch(() => []);

    const shardInformation = values.map((value, index) => `${this.dot} Shard ${index}: ${value ? `**${this.statusString[value.status] || 'UNKNOWN'}** / **${Math.floor(value.ping)}**ms / **${value.guilds}** servers / **${value.users}** users${index === this.client.shard.id ? ' (current)' : ''}` : '**INITIALIZING**'}`).join('\n');

    const embed = new RichEmbed().setDescription(shardInformation);
    context.reply(`${this.client.constants.emotes.homer} Information about shards:`, { embed });
  }

  get statusString() {
    return ({
      0: 'READY',
      1: 'CONNECTING',
      2: 'RECONNECTING',
      3: 'IDLE',
      4: 'NEARLY',
      5: 'DISCONNECTED',
    });
  }
}

module.exports = ShardsCommand;
