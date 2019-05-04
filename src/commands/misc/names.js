const Command = require('../../structures/Command');

class NamesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'names',
      aliases: ['previousnames'],
      children: [new DoNotTrackSubcommand(client)],
      usage: '[user]',
      dm: true,
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    let user = context.message.author;
    if (search && context.message.guild) {
      const foundMembers = this.client.finder.findMembers(context.message.guild.members, search);
      if (!foundMembers || foundMembers.length === 0) return context.replyError(context.__('finderUtil.findMembers.zeroResult', { search }));
      if (foundMembers.length === 1) user = foundMembers[0].user;
      else if (foundMembers.length > 1) return context.replyWarning(this.client.finder.formatMembers(foundMembers, context.settings.misc.locale));
    }

    const data = await this.client.database.getDocument('names', user.id);
    if (!data) return context.replyWarning(context.__('names.noPreviousNames', { name: `**${user.username}**#${user.discriminator}` }));

    const namesInformation = [];
    for (const name of data.names) {
      if (typeof name === 'object') {
        namesInformation.push(`${this.dot} ${name.name} - ${context.__('global.until', {
          time: context.formatDate(name.time),
        })}`)
      } else {
        namesInformation.push(`${this.dot} ${name}`);
      }
    }

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('names.title', { name: `**${user.username}**#${user.discriminator}` }),
      [],
      namesInformation,
      { footer: context.__('names.footer') },
    );
  }
}

class DoNotTrackSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'track',
      aliases: ['untrack', 'donottrack'],
      dm: true,
    });
  }

  async execute(context) {
    if (context.settings.misc.doNotTrackNames) {
      context.settings.misc.doNotTrackNames = false;
      context.saveSettings();
      context.replySuccess(context.__('names.track.disabledNoTracking'));
    } else {
      context.settings.misc.doNotTrackNames = true;
      context.saveSettings();
      context.replySuccess(context.__('names.track.enabledNoTracking'));
    }
  }
}

module.exports = NamesCommand;
