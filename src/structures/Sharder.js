const { ShardingManager } = require('discord.js');

class Sharder extends ShardingManager {
  constructor(file, config) {
    super(file, config.sharder);
    this.config = config;
  }

  eval(code) {
    return eval(code);
  }
}

module.exports = Sharder;
