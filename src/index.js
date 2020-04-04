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
);

client.initialize()
  .then(() => {
    client.login(config.token)
      .then(() => client.logger.log('[gateway] Logged in'))
      .catch(client.logger.error);
  })
  .catch(client.logger.error);
