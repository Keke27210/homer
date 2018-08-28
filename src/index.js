/**
 * Homer, an all-in-one bot for Discord
 * Spawns all required shards to make bot work
 * Copyright (c) 2018 - iDroid27210
 */

// Modules
const Sharder = require('./structures/Sharder');
const Constants = require('./util/Constants');
const config = require('../config.json');
const wait = require('util').promisify(setTimeout);
const request = require('superagent');

// Initializing sharder
const sharder = new Sharder(`${__dirname}/bot.js`, config);

sharder.on('message', async (shard, mail) => {
  if (typeof mail !== 'object') return;

  // Log
  if (mail.type === 'log') {
    console.log(`[Shard ${shard.id}] ${mail.message}`);
  } else if (mail.type === 'error') {
    console.error(`[Shard ${shard.id}] ${mail.message}`);
  }

  // Code
  else if (mail.type === 'code') {
    sharder.eval(mail.code);
  }

  // Action
  else if (mail.type === 'shutdown') {
    const [channel, message, reboot] = mail.message.split('|');
    const shards = sharder.shards.array();

    for (let i = 0; i < shards.length; i += 1) {
      const shard = shards[i];
      shard.process.kill('SIGINT');
    }

    await wait(2500); // Security

    if (reboot === 'true') {
      sharder.shards.deleteAll();
      await spawnShards(true);
      editMessage(channel, message, `${Constants.emotes.success} **${shards.length}** shards restarted successfully!`);
    } else {
      await editMessage(channel, message, `${Constants.emotes.success} **${shards.length}** shards shut down successfully! Ending sharder process.`);
      process.exit();
    }
  }
});

function editMessage(channel, message, content) {
  return request
    .patch(`https://discordapp.com/api/channels/${channel}/messages/${message}`)
    .set('Authorization', `Bot ${config.discord.token}`)
    .set('User-Agent', Constants.userAgent())
    .send({
      content,
    });
}

// Spawn shards
async function spawnShards(respawn = false) {
  if (respawn) {
    for (let i = 0; i < config.sharder.totalShards; i += 1) {
      if (i !== 0 && config.sharder.delay) await wait(config.sharder.delay);
      await sharder.createShard(i);
    }
  } else {
    await sharder.spawn(sharder.config.sharder.totalShards, sharder.config.sharder.delay)
      .then(shards => console.log(`[Sharder] Spawning ${shards.size} shards...`))
      .catch(console.error);
  }
}

spawnShards();
