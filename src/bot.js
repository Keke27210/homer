// Modules
const { DiscordAPIError } = require('discord.js');
const mtz = require('moment-timezone');
const config = require('../config.json');
const { scheduleJob } = require('node-schedule');
const DiscordClient = require('./structures/DiscordClient');

// Initializing client
const client = new DiscordClient(config);

// Connecting
client.login(client.config.discord.token);

// TheDoEverything™
scheduleJob({ second: 10 }, async () => {
  if (!client.ready) return;

  // Handling polls & reminders
  const jobs = await client.database.getDocuments('jobs').then(jobs => jobs.filter((job) => {
    if (job.end - Date.now() < 0) return true;
    return false;
  }));

  for (const job of jobs) {
    client.database.deleteDocument('jobs', job.id);
    if (job.type === 'poll') {
      if (client.other.getShardID(job.guild) != client.shard.id) return;
      client.handler.poll(job);
    } else if (job.type === 'remind') {
      if (client.shard.id !== 0) return;
      client.handler.remind(job);
    }
  }

  // RSS feeds
  if (client.shard.id === 0 && new Date().getMinutes() === 15) {
    client.other.processRSS();
  }

  // Leave inactive radio channels
  const inactives = Object.entries(client.radio.inactivity)
    .filter(([id, time]) => (Date.now() - time) > 300000)
    .map(([id]) => id);

  for (const inactive of inactives) {
    const voiceConnection = client.guilds.get(inactive).voiceConnection;
    if (!voiceConnection) continue;
    voiceConnection.disconnect();
    delete client.radio.inactivity[inactive];
  }

  const calls = await client.database.getDocuments('calls', true)
  // Cancel inactive phone calls
  if (client.shard.id === 0) {
    const inactiveCalls = calls.filter(c => (Date.now() - c.active) > 300000);

    for (const call of inactiveCalls) {
      client.database.deleteDocument('calls', call.id);
      calls.splice(calls.indexOf(call), 1);

      if (call.type === 0) {
        client.sendMessage(call.sender.id, client.__(call.sender.locale, 'telephone.inactive'));
        client.sendMessage(call.receiver.id, client.__(call.receiver.locale, 'telephone.inactive'));
      } else {
        for (const recv of call.receivers) client.sendMessage(recv.id, client.__(recv.locale, 'telephone.inactiveGroup'));
      }
    }
  }

  // Phone call timeouts
  if (client.shard.id === 0) {
    for (const call of calls) {
      if (call.type === 0 && call.state === 0 && (Date.now() - call.start) > 30000) {
        // Sender
        const senderContact = call.sender.contacts.find(c => c.number === call.receiver.number);
        const senderIdentity = senderContact ? `**${senderContact.description}** (**${senderContact.number}**)` : `**${call.receiver.number}**`;
        client.updateMessage(call.sender.id, call.sender.message, client.__(call.sender.locale, 'telephone.outgoingTimeout', { identity: senderIdentity }));

        // Receiver
        const receiverContact = call.receiver.contacts.find(c => c.number === call.sender.number);
        const receiverIdentity = receiverContact ? `**${receiverContact.description}** (**${receiverContact.number}**)` : `**${call.sender.number}**`;
        client.updateMessage(call.receiver.id, call.receiver.message, client.__(call.receiver.locale, 'telephone.incomingTimeout', { identity: receiverIdentity }));

        client.database.deleteDocument('calls', call.id);
      } else if (call.type === 1 && (Date.now() - call.start) > 30000) {
        const main = call.receivers.find(r => r.main);
        for (const receiver of call.receivers) {
          if (receiver.main) continue;

          if ((Date.now() - receiver.start) > 30000 && receiver.state === 0) {
            call.receivers.splice(call.receivers.indexOf(receiver), 1);

            // Main
            const mainContact = main.contacts.find(c => c.number === receiver.number);
            const mainIdentity = mainContact ? `**${mainContact.description}** (\`${mainContact.number}\`)` : `\`${receiver.number}\``;
            client.sendMessage(
              main.id,
              client.__(main.locale, 'telephone.outgoingGroupTimeout', { identity: mainIdentity }),
            );

            // Receiver
            const receiverContact = receiver.contacts.find(c => c.number === main.number);
            const receiverIdentity = receiverContact ? `**${receiverContact.description}** (\`${receiverContact.number}\`)` : `\`${main.number}\``;
            client.updateMessage(
              receiver.id,
              receiver.message,
              client.__(receiver.locale, 'telephone.incomingGroupTimeout', { identity: receiverIdentity }),
            );
          }

          if (call.receivers.length === 1) {
            client.sendMessage(main.id, client.__(main.locale, 'telephone.emptyGroup'));
            client.database.deleteDocument('calls', call.id);
          } else {
            client.database.insertDocument('calls', call, { conflict: 'update' });
          }
        }
      }
    }
  }

  // Data log
  if (new Date().getHours() === 12 && client.shard.id === 0) {
    const stats = await client.database.getDocument('bot', 'stats');
    const commandCount = await client.database.provider.table('commandStats').count();
    const time = Date.now();

    stats.commands.push({ time, count: commandCount });
    stats.guilds.push({ time, count: client.guilds.size });
    client.database.updateDocument('bot', 'stats', stats);
  }
});

// Error handling
process.on('unhandledRejection', (err) => {
  if (err instanceof DiscordAPIError) return;
  client.shard.send({
    type: 'error',
    message: err.stack,
  });

  client.logger.error(`Unhandled rejection:\r\n${err.stack}`);
});

// Shutdown handling
process.on('SIGTERM', async () => {
  await this.client.database.provider.getPoolMaster().drain();
  await this.client.destroy();
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
