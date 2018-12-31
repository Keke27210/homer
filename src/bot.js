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

// Poll & Remind handler
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

  // Cancel inactive phone calls
  if (client.shard.id === 0) {
    const calls = await this.client.database.getDocuments('calls')
      .filter(calls => calls.filter(c => (Date.now() - c.activity) > 300000));

    for (const call of calls) {
      this.client.database.deleteDocument('calls', call.id);

      // Sender
      const senderSettings = (await this.client.database.getDocument('settings', call.sender.settings) || this.client.constants.defaultUserSettings(call.sender.settings)).misc.locale;
      this.client.sendMessage(call.sender.id, this.client.__(senderSettings, 'telephone.inactiveCall'));

      // Receiver
      const receiverSettings = (await this.client.database.getDocument('settings', call.receiver.settings) || this.client.constants.defaultUserSettings(call.receiver.settings)).misc.locale;
      this.client.sendMessage(call.receiver.id, this.client.__(receiverSettings, 'telephone.inactiveCall'));
    }
  }
});

// Error handling
process.on('unhandledRejection', (err) => {
  if (err instanceof DiscordAPIError) return;
  client.shard.send({
    type: 'error',
    message: err.stack,
  });

  client.sendMessage(
    client.config.misc.ownerDm,
    [
      `\`[${mtz().format('HH:mm:ss')}]\` ${client.constants.emotes.warning} **Unhandled rejection** on shard **${client.shard.id}** ${client.constants.emotes.warning}`,
      `\`\`\`js\n${err.stack}\`\`\``,
    ].join('\n'),
  );
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
