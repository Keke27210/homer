/**
 * Homer - a true Swiss knife for your Discord server
 * Copyright (c) 2020 - Kevin B. - Apache 2.0 License
 */

const { ShardingManager } = require('discord.js');
const { resolve } = require('path');

const Logger = require('./structures/Logger');

const config = require(process.argv.includes('DEBUG')
  ? '../config/development.json'
  : '../config/production.json');

const sharder = new ShardingManager(
  resolve(_dirname, 'bot.js'),
  config.sharderOptions,
);

sharder.logger = new Logger(-1);

sharder.on('shardCreate', (shard) => {
  sharder.logger.log(`[sharder] Created shard ${shard.id}`);
});

sharder.spawn();

