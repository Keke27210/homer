const Command = require('../../structures/Command');
const { splitMessage } = require('discord.js').Util;

class TagCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tag',
      aliases: ['t'],
      usage: '<tag name> [tag argument(s)]',
      category: 'misc',
      children: [
        new CreateSubcommand(client),
        new EditSubcommand(client),
        new DeleteSubcommand(client),
        new OwnerSubcommand(client),
        new RawSubcommand(client),
        new RawtwoSubcommand(client),
        new ListSubcommand(client),
        new ImportSubcommand(client),
        new UnimportSubcommand(client),
        new CommandsSubcommand(client),
        new ExecSubcommand(client),
      ],
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    const args = context.args.slice(1);
    if (!name) return context.replyError(context.__('tag.noName'));

    const tag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!tag) return context.replyWarning(context.__('tag.unknownTag', { name }));

    if (!context.message.channel.nsfw && tag.content.toLowerCase().includes('{nsfw}')) {
      return context.replyWarning(context.__('tag.nsfwAlert'));
    }

    const m = await context.replyLoading(context.__('global.loading'));
    setTimeout(() => {
      if (!m.editedTimestamp) m.edit(`${this.client.constants.emotes.warning} ${context.__('tag.execError')}`);
    }, 10000);

    const parsed = await this.client.lisa.parseString(context, tag.content, 'tag', args);
    m.edit(parsed.content || '', { embed: parsed.embed });
  }
}

class CreateSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create',
      usage: '<tag name> <tag content>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    const content = context.args.slice(1).join(' ');
    if (!name) return context.replyError(context.__('tag.create.noName'));
    if (!content) return context.replyError(context.__('tag.create.noContent'));
    if (name.match(/<(@!?|@&)(\d{17,20})>/g)) return context.replyWarning(context.__('tag.create.containsMentions'));

    const existentTag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (existentTag) return context.replyWarning(context.__('tag.create.alreadyExist', { name }));

    await this.client.database.insertDocument(
      'tags',
      {
        id: name.toLowerCase(),
        content,
        creation: Date.now(),
        edit: null,
        author: context.message.author.id,
      },
    );
    context.replySuccess(context.__('tag.create.created', { name }));
  }
}

class EditSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'edit',
      usage: '<tag name> <tag content>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    const content = context.args.slice(1).join(' ');
    if (!name) return context.replyError(context.__('tag.edit.noName'));
    if (!content) return context.replyError(context.__('tag.edit.noContent'));

    const existentTag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag) return context.replyWarning(context.__('tag.notFound', { name }));
    if (existentTag.author !== context.message.author.id) return context.replyError(context.__('tag.edit.cantInteract', { name }));

    await this.client.database.updateDocument(
      'tags',
      existentTag.id,
      {
        content,
        edit: Date.now(),
      },
    );
    context.replySuccess(context.__('tag.edit.edited', { name }));
  }
}

class DeleteSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete',
      aliases: ['remove'],
      usage: '<tag name>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('tag.delete.noName'));

    const existentTag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag) return context.replyWarning(context.__('tag.notFound', { name }));
    if (existentTag.author !== context.message.author.id) return context.replyError(context.__('tag.delete.cantInteract', { name }));

    await this.client.database.deleteDocument('tags', existentTag.id);
    context.replySuccess(context.__('tag.delete.deleted', { name }));

    this.client.database.getDocuments('settings').then((settings) => {
      const affected = settings.filter(s => s.importedTags.includes(existentTag.id));
      for (const setting of affected) {
        setting.importedTags.splice(setting.importedTags.indexOf(existentTag.id), 1);
        this.client.database.updateDocument('settings', setting.id, { importedTags: setting.importedTags });
      }
    });
  }
}

class OwnerSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'owner',
      aliases: ['author'],
      usage: '<tag name>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('tag.noName'));

    const existentTag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag) return context.replyWarning(context.__('tag.notFound', { name }));

    const author = await this.client.fetchUser(existentTag.author).then(u => `**${u.username}**#${u.discriminator} (ID:${u.id})`);
    context.replySuccess(context.__('tag.owner.owner', {
      author,
      name,
    }));
  }
}

class RawSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'raw',
      usage: '<tag name>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('tag.noName'));

    const existentTag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag) return context.replyWarning(context.__('tag.notFound', { name }));

    context.reply(existentTag.content);
  }
}

class RawtwoSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'raw2',
      usage: '<tag name>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('tag.noName'));

    const existentTag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag) return context.replyWarning(context.__('tag.notFound', { name }));

    context.reply(existentTag.content, { code: 'js' });
  }
}

class ListSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list',
      category: 'misc',
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

    const userTags = await this.client.database.findDocuments('tags', { author: user.id }, true);
    if (userTags.length === 0) return context.replyWarning(context.__('tag.list.noTag', { name: `**${user.username}**#${user.discriminator}` }));

    const msgs = splitMessage([
      `${this.client.constants.emotes.success} ${context.__('tag.list.listFor', { name: `**${user.username}**#${user.discriminator}` })}`,
      userTags.map(t => t.id).join(' '),
    ].join('\n'));

    if (typeof msgs === 'string') context.reply(msgs);
    else {
      for (const msg of msgs) await context.reply(msg);
    }
  }
}

class ImportSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'import',
      usage: '<tag name>',
      userPermissions: ['MANAGE_GUILD'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('tag.import.noTag'));

    const tag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!tag) return context.replyWarning(context.__('tag.notFound', { name }));

    if (context.settings.importedTags.includes(tag.id)) return context.replyWarning(context.__('tag.import.alreadyImported', { name: tag.id }));
    context.settings.importedTags.push(tag.id);
    await context.saveSettings();

    context.replySuccess(context.__('tag.import.imported', { name: tag.id }));
  }
}

class UnimportSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unimport',
      usage: '<tag name>',
      userPermissions: ['MANAGE_GUILD'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('tag.unimport.noTag'));

    const tag = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!tag) return context.replyWarning(context.__('tag.notFound', { name }));

    if (!context.settings.importedTags.includes(tag.id)) return context.replyWarning(context.__('tag.unimport.notImported', { name: tag.id }));
    context.settings.importedTags.splice(context.settings.importedTags.indexOf(tag.id), 1);
    await context.saveSettings();

    context.replySuccess(context.__('tag.unimport.unimported', { name: tag.id }));
  }
}

class ExecSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'exec',
      usage: '<content>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const content = context.args.join(' ');
    if (!content) return context.replyError(context.__('tag.exec.noContent'));

    const m = await context.replyLoading(context.__('global.loading'));
    setTimeout(() => {
      if (!m.editedTimestamp) m.edit(`${this.client.constants.emotes.warning} ${context.__('tag.execError')}`);
    }, 10000);

    const parsed = await this.client.lisa.parseString(context, content, 'tag');
    m.edit(parsed.content || '', { embed: parsed.embed });
  }
}

class CommandsSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'commands',
      aliases: ['imported'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const name = context.message.guild ? `**${context.message.guild.name}**` : `**${context.message.author.username}**#${context.message.author.discriminator}`;
    const importedTags = context.settings.importedTags;
    if (importedTags.length === 0) return context.replyWarning(context.__('tag.commands.noImportedTag', { name }));

    const message = splitMessage([
      `${context.__('tag.commands.title', { name })}`,
      importedTags.join(' '),
    ].join('\n'));

    if (typeof message === 'string') return context.reply(message);
    for (const m of message) await context.reply(m);
  }
}

module.exports = TagCommand;
