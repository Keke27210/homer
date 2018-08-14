const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class BaninfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'baninfo',
      category: 'general',
      usage: '<user>',
      userPermissions: ['BAN_MEMBERS'],
    });
  }

  async execute(context) {
    const bans = await context.message.guild.fetchBans();
    const auditLogs = await context.message.guild.fetchAuditLogs();

    const search = context.args.join(' ');
    let user = null;
    if (search) {
      const foundUsers = this.client.finder.findUsers(bans, search);
      if (!foundUsers || foundUsers.length === 0) return context.replyError(context.__('finderUtil.findUsers.zeroResult', { search }));
      else if (foundUsers.length === 1) user = foundUsers[0];
      else return context.replyWarning(this.client.finder.formatUsers(foundUsers, context.settings.misc.locale));
    } else {
      return context.replyError(context.__('baninfo.noQuery'));
    }

    const logEntry = auditLogs.entries.find(e => e.action === 'MEMBER_BAN_ADD' && e.target.id === user.id);

    const embed = new RichEmbed()
      .setDescription([
        `${this.dot} ${context.__('baninfo.embed.targetID')}: **${user.id}**`,
        `${this.dot} ${context.__('baninfo.embed.executor')}: ${logEntry && logEntry.executor ? `**${logEntry.executor.username}**#${logEntry.executor.discriminator} (ID:${logEntry.executor.id})` : `*${context.__('global.unknown')}*`}`,
        `${this.dot} ${context.__('baninfo.embed.reason')}: ${logEntry && logEntry.reason ? `**${logEntry.reason}**` : context.__('global.none')}`,
        `${this.dot} ${context.__('baninfo.embed.date')}: ${logEntry ? `**${context.formatDate(logEntry.createdTimestamp)}**` : context.__('global.none')}`,
      ].join('\n'))
      .setThumbnail(user.displayAvatarURL);

    context.reply(
      context.__('baninfo.title', { user: `**${user.username}**#${user.discriminator}` }),
      { embed },
    );
  }
}

module.exports = BaninfoCommand;
