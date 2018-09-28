const Command = require('../../structures/Command');
const Menu = require('../../structures/Menu');
const { RichEmbed } = require('discord.js');

class ProfileCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'profile',
      category: 'misc',
      aliases: ['p'],
      children: [
        new SetSubcommand(client),
        new ClearSubcommand(client),
        new FieldsSubcommand(client),
      ],
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

    const profile = await this.client.database.getDocument('profiles', user.id);
    if (!profile) {
      return context.replyWarning(context.__('profile.noProfile', {
        name: `**${user.username}**#${user.discriminator}`,
        command: `${this.client.prefix}profile set`,
      }));
    }

    const profileInformation = profile.fields
      .sort((a, b) => a.id > b.id)
      .map((field) => {
        const profileField = (this.client.constants.profileFields.find(f => f.id === field.id) || field.id);
        return `${this.dot} ${profileField.name}: **${field.value}**`;
      })
      .join('\n');

    const embed = new RichEmbed().setDescription(profileInformation);
    context.reply(
      context.__('profile.title', { name: `**${user.username}**#${user.discriminator}` }),
      { embed },
    );
  }
}

class SetSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'set',
      category: 'misc',
      usage: '<name> <content>',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    const value = context.args.slice(1).join(' ');
    if (!name) return context.replyError(context.__('profile.set.noName'));
    if (!value) return context.replyError(context.__('profile.set.noValue'));
    if (value.length > 128) return context.replyWarning(context.__('profile.set.valueTooLong'));
    if (!this.client.constants.profileFields.find(f => f.id === name.toLowerCase())) {
      return context.replyWarning(context.__('profile.invalidName', { name: name.toLowerCase(), command: `${this.client.prefix}profile fields` }));
    }

    const profile = await this.client.database.getDocument('profiles', context.message.author.id) || getProfile(context.message.author.id);
    if (profile.fields.length > 20) return context.replyWarning(context.__('profile.set.tooMuchFields'));

    const existingField = profile.fields.find(f => f.id === name.toLowerCase());
    if (existingField) profile.fields.splice(profile.fields.indexOf(existingField), 1);
    profile.fields.push({
      id: name.toLowerCase(),
      value,
    });

    await this.client.database.insertDocument('profiles', profile, { conflict: 'update' });
    context.replySuccess(context.__('profile.set.updated', { name: name.toLowerCase() }));
  }
}

class ClearSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      category: 'misc',
      usage: '<name>',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('profile.clear.noName'));
    if (!this.client.constants.profileFields.find(f => f.id === name.toLowerCase())) {
      return context.replyWarning(context.__('profile.invalidName', {
        name: name.toLowerCase(),
        command: `${this.client.prefix}profile fields`,
      }));
    }

    const profile = await this.client.database.getDocument('profiles', context.message.author.id) || getProfile(context.message.author.id);
    const existingField = profile.fields.find(f => f.id === name.toLowerCase());
    if (!existingField) return context.replyWarning(context.__('profile.clear.notFound', { name: name.toLowerCase() }));
    profile.fields.splice(profile.fields.indexOf(existingField), 1);

    await this.client.database.insertDocument('profiles', profile, { conflict: 'update' });
    context.replySuccess(context.__('profile.clear.cleared', { name: name.toLowerCase() }));
  }
}

class FieldsSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'fields',
      aliases: ['list'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const menu = new Menu(
      context,
      this.client.constants.profileFields.map(field => `${this.dot} \`${field.id}\`: **${field.name}**`),
    );

    menu.send(context.__('profile.fields'));
  }
}

module.exports = ProfileCommand;

function getProfile(id) {
  return ({
    id,
    fields: [],
    creation: Date.now(),
    edit: null,
  });
}
