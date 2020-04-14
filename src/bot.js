const { resolve } = require('path');

if (process.cwd() !== resolve(__dirname, '..')) {
  throw new Error('You must run this file from the root directory of Homer.');
}

// Load extended structures first
require('./extenders/Guild');
require('./extenders/Message');
require('./extenders/User');

const DiscordClient = require('./structures/DiscordClient');

const config = require(process.argv.includes('DEBUG')
  ? '../config/development.json'
  : '../config/production.json');

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

process.on('SIGTERM', client.shutdown.bind(client));
process.on('SIGINT', client.shutdown.bind(client));
process.on('SIGHUP', client.shutdown.bind(client));
