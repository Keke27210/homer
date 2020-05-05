/**
 * Homer - a true Swiss knife for your Discord server
 * Copyright (c) 2020 - Kevin B. - Apache 2.0 License
 */

const { ShardingManager } = require('discord.js');
const { resolve } = require('path');
const { inspect } = require('util');

const Logger = require('./structures/Logger');

if (process.cwd() !== resolve(__dirname, '..')) {
  throw new Error('You must run this file from the root directory of Homer.');
}

const config = require(process.argv.includes('DEBUG')
  ? '../config/development.json'
  : '../config/production.json');

const sharder = new ShardingManager(
  resolve(__dirname, 'bot.js'),
  config.sharderOptions,
);

sharder.logger = new Logger(-1);

/**
 * Handles a command from process.stdin
 * @param {string|Buffer} message Message coming from stdin
 */
async function handleCommand(message) {
  if (Buffer.isBuffer(message)) message = Buffer.toString();
  if (!message.startsWith('/')) return process.stdout.write('Unexpected input - Commands must start with / prefix');
  const [command, ...args] = message.trim().substring(1).split(/ +/g);
  if (!command) return process.stdout.write('Unexpected input - No command provided');

  if (command === 'eval') {
    const code = args.join(' ');

    let result;
    try {
      result = await sharder.broadcastEval(code);
    } catch (e) {
      result = e;
    }

    if (typeof result !== 'string') result = inspect(result);
    if (result.length > 2000) result = 'Output exceeding 2000 characters';
    process.stdout.write(`${result}\n`);
  } else if (command === 'ping') {
    const pings = await sharder.fetchClientValues('ws.ping');
    process.stdout.write(`Pings: ${pings.join(' / ')}`);
  } else {
    process.stdout.write(`Unknown command: ${command}`);
  }
}

// Listen to stdin for command handling
process.stdin
  .setEncoding('utf8')
  .on('data', handleCommand);

/**
 * Handles a shard message
 * @param {Shard} shard Shard that sent the message
 * @param {*} message Message the shard sent
 */
function handleMessage(shard, message) {
  if (typeof message === 'string') {
    if (message.startsWith('RESTART_')) {
      const id = parseInt(message.split('_')[1], 10);
      const s = sharder.shards.get(id);
      if (s) {
        sharder.logger.warn(`[shard ${shard.id}] RESTARTING SHARD ${id}`);
        s.respawn(1500);
      }
    } else if (message === 'RESTARTALL') {
      sharder.logger.warn(`[shard ${shard.id}] RESTARTING ALL SHARDS`);
      sharder.respawnAll(5000, 1500);
    } else if (message.startsWith('KILL_')) {
      const id = parseInt(message.split('_')[1], 10);
      const s = sharder.shards.get(id);
      if (s) {
        sharder.logger.warn(`[shard ${shard.id}] KILLING SHARD ${id}`);
        s.kill();
      }
    } else if (message === 'KILLALL') {
      sharder.logger.warn(`[shard ${shard.id}] KILLING ALL SHARDS`);
      sharder.shards.forEach((s) => s.kill());
    } else {
      sharder.logger.log(`[shard ${shard.id}] ${message}`);
    }
  }
}

sharder.on('shardCreate', (shard) => {
  sharder.logger.log(`[sharder] Created shard ID ${shard.id}`);
  shard.on('message', (message) => handleMessage(shard, message));
  shard.on('ready', () => sharder.logger.log(`[shard ${shard.id}] Ready was received`));
  shard.on('reconnecting', () => sharder.logger.log(`[shard ${shard.id}] Reconnecting...`));
});

sharder.spawn()
  .then(() => sharder.logger.log('[sharder] Spawned shards successfully'))
  .catch((error) => sharder.logger.error('AN ERROR OCCURED DURING SHARD SPAWNING', error));
