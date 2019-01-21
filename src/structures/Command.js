const { RichEmbed } = require('discord.js');

class Command {
  /**
   * @param {*} client Client that intantiated the command
   * @param {CommandOptions} commandOptions Options of the command
   */
  constructor(client, commandOptions) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
    this.name = commandOptions.name;
    this.aliases = commandOptions.aliases || [];
    this.category = commandOptions.category || 'other';
    this.usage = commandOptions.usage || null;
    this.dm = commandOptions.dm || false;
    this.userPermissions = commandOptions.userPermissions || [];
    this.botPermissions = commandOptions.botPermissions || [];
    this.children = commandOptions.children || [];
    this.private = commandOptions.private || false;
    this.hidden = commandOptions.hidden || this.private;
  }

  get dot() {
    return this.client.constants.emotes.dot;
  }

  async run(context, parent = []) {
    // Goodbye if maintenance
    if (this.client.maintenance && !this.client.config.owners.includes(context.message.author.id)) return;

    // We stop right now if there is 'SEND_MESSAGES' or 'EMBED_LINKS' missing
    if (context.message.guild) {
      const missing = context.message.channel.permissionsFor(this.client.user).missing(['SEND_MESSAGES', 'EMBED_LINKS']);
      if (missing.length > 0) {
        return context.message.author.send(`${this.client.constants.emotes.error} ${context.__(
          'commandHandler.missingBotPermissions',
          { permissions: missing.map(p => `\`${p}\``).join(', ') },
        )}`);
      }
    }

    // We use this for help
    parent.push(this.name);

    // Help & subcommands
    if (context.args.length > 0) {
      const tempArgs = context.args[0];

      if (tempArgs === 'help' && !this.hidden) {
        let description = context.__('helpUtil.noDescription');
        if (this.client.localization.hasKey(context.settings.misc.locale, `helpUtil.${parent.join('.')}`)) {
          description = context.__(`helpUtil.${parent.join('.')}`);
        }

        const embed = new RichEmbed()
          .setDescription([
            description,
            '',
            `${this.dot} ${context.__('commandHandler.help.aliases')}: ${this.aliases.map(a => `\`${a}\``).join(', ')}`,
            `${this.dot} ${context.__('commandHandler.help.usage')}: \`${this.client.prefix}${parent.join('.')} ${this.usage}\``,
          ].join('\n'))
          .setColor(this.client.constants.categoryColors[this.category] || undefined);

        const children = this.children.filter(c => !c.hidden);
        if (children.length > 0) {
          const msg = [];
          children.forEach((c) => {
            let description = context.__('helpUtil.noDescription');
            if (this.client.localization.hasKey(context.settings.misc.locale, `helpUtil.${parent.join('.')}.${c.name}`)) {
              description = context.__(`helpUtil.${parent.join('.')}.${c.name}`);
            }

            msg.push(`${this.dot} \`${this.client.prefix}${parent.join('.')} ${children.name}\` - ${description}`);
          });
          embed.addField(context.__('commandHandler.help.subcommands'), msg.join('\n'));
        }

        try {
          await context.message.author.send(
            context.__('commandHandler.help.title', { command: parent.join(' ') }),
            { embed },
          ).then(() => {
            context.reactSuccess();
          });
        } catch (e) {
          context.replyWarning(context.__('commandHandler.help.cannotSend'));
          context.reactError();
        }
      } if (tempArgs) {
        const subcommand = this.children.find(c => c.name === tempArgs.toLowerCase() || c.aliases.includes(tempArgs.toLowerCase()));
        if (subcommand) {
          context.args.shift();
          return subcommand.run(context, parent);
        }
      }
    }

    // Owner check
    if (this.private && !this.client.config.owners.includes(context.message.author.id)) return;

    if (context.message.guild) {
      // Ignored entities checking
      if (context.settings.ignored.find(i => i.id === context.message.channel.id)) return;
      if (context.settings.ignored.find(i => i.id === context.message.author.id)) return;
      if (context.settings.ignored.find(i => i.id === this.name)) return;
    }

    // Blacklist
    const blacklistEntry = await this.client.database.getDocument('blacklist', context.message.author.id);
    if (blacklistEntry && this.category !== 'owner') {
      const embed = new RichEmbed()
        .setDescription([
          `${this.dot} ${context.__('commandHandler.blacklist.reason')}: **${blacklistEntry.reason || context.__('global.noReason')}**`,
          `${this.dot} ${context.__('commandHandler.blacklist.date')}: **${context.formatDate(blacklistEntry.time)}**`,
        ].join('\n'))
        .setFooter(context.__('commandHandler.blacklist.footer'));

      return context.replyWarning(
        context.__('commandHandler.blacklist.title'),
        { embed },
      );
    }

    // Check if the command can be ran
    if (!this.client.config.owners.includes(context.message.author.id) && !this.isAllowed(context.message.channel, parent) && this.category !== 'owner') {
      return context.replyError(context.__('commandHandler.unauthorized'));
    }

    // Check if the command can be used in DMs
    if (!this.dm && !context.message.guild) {
      return context.replyError(context.__('commandHandler.unavailableInDM'));
    }

    if (context.message.guild) {
      // Permissions
      const missingUserPermissions = await context.message.guild.fetchMember(context.message.author.id)
        .then(m => m.permissionsIn(context.message.channel).missing(this.userPermissions))
        .catch(() => ([]));
      if (missingUserPermissions.length > 0) {
        return context.replyError(context.__(
          'commandHandler.missingUserPermissions',
          { permissions: this.client.other.humanizePermissions(missingUserPermissions, context.settings.misc.locale) },
        ));
      }

      const missingBotPermissions = await context.message.guild.fetchMember(this.client.user.id)
        .then(m => m.permissionsIn(context.message.channel).missing(this.botPermissions))
        .catch(() => ([]));
      if (missingBotPermissions.length > 0) {
        return context.replyError(context.__(
          'commandHandler.missingBotPermissions',
          { permissions: this.client.other.humanizePermissions(missingBotPermissions, context.settings.misc.locale) },
        ));
      }
    }

    // Check cooldown
    const cooldownTime = this.client.cooldown[context.message.author.id];
    if (cooldownTime) {
      const difference = ((Date.now() - cooldownTime) / 1000).toFixed(2);
      return context.replyWarning(context.__(
        'commandHandler.cooldown',
        { time: difference },
      ));
    }

    // Insert stats and cooldown
    if (!this.client.config.owners.includes(context.message.author.id)) {
      this.client.cooldown[context.message.author.id] = Date.now();
      this.client.setTimeout(() => { delete this.client.cooldown[context.message.author.id]; }, 2500);
      this.client.database.insertDocument('commandStats', {
        author: context.message.author.id,
        guild: context.message.guild ? context.message.guild.id : 'dm',
        command: parent.join(' '),
        args: context.args,
        time: Date.now(),
      });
    }

    // Execute command
    try {
      await this.execute(context);
    } catch (e) {
      context.replyError(context.__('commandHandler.error'));

      this.client.shard.send({
        type: 'error',
        message: e.stack,
      });
    }
  }

  isAllowed(channel, parent) {
    if (!channel.topic) return true;
    const topic = channel.topic.toLowerCase();

    // Command overwrites
    if (topic.includes(`{${parent.join(' ')}}`)) return true;
    for (let i = 0; i < parent.length; i += 1) {
      const name = parent.slice(0, (i + 1)).join(' ');
      if (topic.includes(`{-${name}}`)) return false;
    }

    // Category overwrites
    if (topic.includes(`{${this.category}}`)) return true;
    if (topic.includes(`{-${this.category}}`)) return false;

    // All
    if (topic.includes('{-all}')) return false;
    return true;
  }
}

module.exports = Command;

/**
 * @typedef CommandOptions
 * @property {string} name Name of the command
 * @property {?string[]} aliases Aliases for the command
 * @property {string} category Category of the command
 * @property {?string} usage Arguments for the command
 * @property {?boolean} dm Can the command only be used in DMs
 * @property {?string} userPermissions Permissions required by the user
 * @property {?string} botPermissions Permissions required by the bot
 * @property {?Command[]} children Subcommands
 * @property {?boolean} private Is the command owner-only
 * @property {?boolean} hidden Is the command hidden in help (default: this.private)
 */
