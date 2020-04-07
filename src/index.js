/**
 * Homer - a true Swiss knife for your Discord server
 * Copyright (c) 2020 - Kevin B. - Apache 2.0 License
 */

// Load extended structures first
require('./extenders/Guild');
require('./extenders/Message');
require('./extenders/User');

const DiscordClient = require('./structures/DiscordClient');

const config = require('../config/production.json');

const client = new DiscordClient(
  config.clientOptions,
  config.databaseCredentials,
  config.owners,
);

(async function login() {
  client.logger.log('[client] Initializing client...');
  await client.initialize();
  client.logger.log('[client] Client initialized!');

  client.logger.log('[gateway] Connecting to the gateway');
  await client.login(config.token);
  client.logger.log('[gateway] Logged in');
}())
  .catch((error) => {
    client.logger.error('AN ERROR OCCURED DURING BOT STARTUP', error);
    client.shutdown(-1);
  });

process.on('SIGINT', client.shutdown.bind(client));
process.on('SIGHUP', client.shutdown.bind(client));
