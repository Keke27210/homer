const { ShardingManager } = require('discord.js');

class Sharder extends ShardingManager {
  constructor(file, config) {
    super(file, config.sharder);
    this.config = config;
  }

  async eval(code) {
    await eval(code);
  }
}

module.exports = Sharder;
