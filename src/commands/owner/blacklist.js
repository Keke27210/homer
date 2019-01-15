const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const request = require('superagent');

class BlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      category: 'owner',
      private: true,
      children: [new GuildSubcommand(client), new UserSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    context.replyWarning(`Available subcommands: ${this.children.map(c => `\`${c.name}\``).join(', ')}.`);
  }
}

class GuildSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'guild',
      aliases: ['server'],
      category: 'owner',
      children: [new GuildStatusSubcommand(client)],
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const guildID = context.args[0];
    const reason = context.args.slice(1).join(' ') || null;
    if (!guildID) return context.replyError('You must provide the ID of a guild to (un)blacklist.');

    const blacklistEntry = await this.client.database.getDocument('blacklist', guildID);
    const guildEntry = await request
      .get(`https://discordapp.com/api/guilds/${guildID}/widget.json`)
      .set({ 'User-Agent': this.client.constants.userAgent() })
      .then(res => res.body)
      .catch(res => (res.body.code === 10004 ? null : {}));

    if (blacklistEntry) {
      await this.client.database.deleteDocument('blacklist', guildID);
      context.replySuccess(`The guild **${guildEntry.name || guildID}** has been removed from the blacklist.`);
    } else {
      if (!guildEntry) return context.replyError(`No guild found matching ID **${guildID}**.`);

      await this.client.database.insertDocument(
        'blacklist',
        { id: guildID, reason, time: Date.now() },
      );
      context.replySuccess(`The guild **${guildEntry.name || guildID}** has been added to the blacklist.`);
    }
  }
}

class GuildStatusSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'status',
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  get dot() {
    return this.client.constants.emotes.dot;
  }

  async execute(context) {
    const guildID = context.args[0];
    if (!guildID) return context.replyError('You must provide the ID of a blacklisted guild.');

    const guild = await request
      .get(`https://discordapp.com/api/guilds/${guildID}/widget.json`)
      .set({ 'User-Agent': this.client.constants.userAgent() })
      .then(res => res.body)
      .catch(() => ({}));

    const blacklistEntry = await this.client.database.getDocument('blacklist', guildID);
    if (!blacklistEntry) return context.replyWarning(`No blacklist entry found for guild ID **${guildID}**.`);

    const embed = new RichEmbed()
      .setDescription([
        `${this.dot} Reason: **${blacklistEntry.reason || context.__('global.none')}**`,
        `${this.dot} Blacklist date: **${context.formatDate(blacklistEntry.time)}**`,
      ].join('\n'));

    context.replySuccess(`Blacklist information for guild **${guild.name || guildID}**:`, { embed });
  }
}

class UserSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'user',
      category: 'owner',
      children: [new UserStatusSubcommand(client)],
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const userID = context.args[0];
    const reason = context.args.slice(1).join(' ') || null;
    if (!userID) return context.replyError('You must provide the ID of a guild to (un)blacklist.');

    const blacklistEntry = await this.client.database.getDocument('blacklist', userID);
    const userEntry = await this.client.fetchUser(userID)
      .catch(() => null);

    if (blacklistEntry) {
      await this.client.database.deleteDocument('blacklist', userID);
      context.replySuccess(`The user ${userEntry ? `**${userEntry.username}**#${userEntry.discriminator}` : `**${userID}**`} has been removed from the blacklist.`);
    } else {
      if (!userEntry) return context.replyError(`No user found matching ID **${userID}**.`);

      await this.client.database.insertDocument(
        'blacklist',
        { id: userID, reason, time: Date.now() },
      );
      context.replySuccess(`The user ${userEntry ? `**${userEntry.username}**#${userEntry.discriminator}` : `**${userID}**`} has been added to the blacklist.`);
    }
  }
}

class UserStatusSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'status',
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  get dot() {
    return this.client.constants.emotes.dot;
  }

  async execute(context) {
    const userID = context.args[0];
    if (!userID) return context.replyError('You must provide the ID of a blacklisted user.');

    const userEntry = await this.client.fetchUser(userID)
      .catch(() => null);

    const blacklistEntry = await this.client.database.getDocument('blacklist', userID);
    if (!blacklistEntry) return context.replyWarning(`No blacklist entry found for user ID **${userID}**.`);

    const embed = new RichEmbed()
      .setDescription([
        `${this.dot} Reason: **${blacklistEntry.reason || context.__('global.none')}**`,
        `${this.dot} Blacklist date: **${context.formatDate(blacklistEntry.time)}**`,
      ].join('\n'));

    context.replySuccess(`Blacklist information for user ${userEntry ? `**${userEntry.username}**#${userEntry.discriminator}` : `**${userID}**`}:`, { embed });
  }
}

module.exports = BlacklistCommand;
