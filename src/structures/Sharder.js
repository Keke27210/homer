const { ShardingManager } = require('discord.js');
const request = require('superagent');

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
