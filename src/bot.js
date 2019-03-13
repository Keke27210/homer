/* Bot process for one shard - To run the bot, run the "index.js" file not this one */

// Modules
const DiscordClient = require('./structures/DiscordClient');
const { DiscordAPIError } = require('discord.js');
const config = require('../config.json');
const { scheduleJob } = require('node-schedule');

// Initializing client
const client = new DiscordClient(config);

// Connecting
client.login(client.config.discord.token);

// Routines handler
scheduleJob({ second: 10 }, async () => {
  if (!client.ready) return;

  for (const routine of client.routines) {
    routine.handle();
  }
});

// Error handling
process.on('unhandledRejection', (err) => {
  if (err instanceof DiscordAPIError) return; // Ignore permissions, connection, etc errors
  client.shard.send({
    type: 'error',
    message: err.stack,
  });

  client.logger.error(`Unhandled rejection:\r\n${err.stack}`);
});

// Shutdown handling
process.on('SIGTERM', async () => {
  await client.database.provider.getPoolMaster().drain();
  await client.destroy();
  client.logger.info(`Shutting down shard ID ${client.shard.id}`);
  process.exit();
});

// Misc
String.prototype.replaceAll = function (search, replacement) {
  return this.split(search).join(replacement);
};

String.prototype.hashCode = function () {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }
  return hash;
};
