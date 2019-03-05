const Command = require('../../structures/Command');
const { Attachment } = require('discord.js');
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
        new OverrideSubcommand(client),
        new UnoverrideSubcommand(client),
        new SearchSubcommand(client),
        new DomainsSubcommand(client),
      ],
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    const args = context.args.slice(1);
    if (!name) return context.replyError(context.__('tag.noName'));

    const tag = context.settings.tagOverrides.find(t => t.name === name.toLowerCase()) || await this.client.database.getDocument('tags', name.toLowerCase());
    if (!tag || !tag.content) return context.replyWarning(context.__('tag.unknownTag', { name }));

    if (!context.message.channel.nsfw && tag.content.toLowerCase().includes('{nsfw}')) {
      return context.replyWarning(context.__('tag.nsfwAlert'));
    }

    let processed = false;
    const m = await context.replyLoading(context.__('global.loading'));
    setTimeout(() => {
      if (!processed) m.edit(`${this.client.constants.emotes.warning} ${context.__('tag.execError')}`);
    }, 10000);

    const parsed = await this.client.lisa.parseString(context, tag.content, 'tag', args);
    processed = true;
    m.edit(parsed.content ? parsed.content.replace('@everyone', '!EVERYONE').replace('@here', '!HERE') : '', {
      embed: parsed.embed,
      files: tag.attachments,
    });

    for (const reaction of parsed.reactions) await m.react(reaction).catch(() => null);
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
        attachments: context.message.attachments.map(a => ({ name: a.filename, attachment: a.url })) || null,
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
        attachments: context.message.attachments.map(a => ({ name: a.filename, url: a.url })) || null,
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

    const existentTag = context.settings.tagOverrides.find(t => t.name === name.toLowerCase()) || await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag) return context.replyWarning(context.__('tag.notFound', { name }));

    const author = existentTag.author === 'SERVER' ?
      context.__('tag.belongsServer') :
      await this.client.fetchUser(existentTag.author).then(u => `**${u.username}**#${u.discriminator} (ID:${u.id})`);

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

    const existentTag = context.settings.tagOverrides.find(t => t.name === name.toLowerCase()) || await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag || !existentTag.content) return context.replyWarning(context.__('tag.notFound', { name }));

    context.reply(existentTag.content.replace('@everyone', '!EVERYONE').replace('@here', '!HERE'));
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

    const existentTag = context.settings.tagOverrides.find(t => t.name === name.toLowerCase()) || await this.client.database.getDocument('tags', name.toLowerCase());
    if (!existentTag || !existentTag.content) return context.replyWarning(context.__('tag.notFound', { name }));

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

    let processed = false;
    const m = await context.replyLoading(context.__('global.loading'));
    setTimeout(() => {
      if (!processed) m.edit(`${this.client.constants.emotes.warning} ${context.__('tag.execError')}`);
    }, 10000);

    const parsed = await this.client.lisa.parseString(context, content, 'tag');
    processed = true;
    m.edit(parsed.content ? parsed.content.replace('@everyone', '!EVERYONE').replace('@here', '!HERE') : '', { embed: parsed.embed });
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

class OverrideSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'override',
      category: 'misc',
      usage: '<tag name> [new content]',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    const content = context.args.slice(1).join(' ');
    if (!name) return context.replyError(context.__('tag.override.noTag'));

    const tagDocument = await this.client.database.getDocument('tags', name.toLowerCase());
    if (!tagDocument) return context.replyWarning(context.__('tag.override.notFound', { name }));

    const index = context.settings.tagOverrides.findIndex(t => t.name === tagDocument.id);
    if (index !== -1) context.settings.tagOverrides.splice(index, 1);
    context.settings.tagOverrides.push({
      name: tagDocument.id,
      content: content || null,
      author: 'SERVER',
    });

    await context.saveSettings();
    context.replySuccess(context.__('tag.override.created', { name: tagDocument.id }));
  }
}

class UnoverrideSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unoverride',
      category: 'misc',
      usage: '<tag name>',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    if (!name) return context.replyError(context.__('tag.unoverride.noTag'));

    const index = context.settings.tagOverrides.findIndex(t => t.name === name.toLowerCase());
    if (index === -1) return context.replyWarning(context.__('tag.unoverride.notFound', { name: name.toLowerCase() }));

    context.settings.tagOverrides.splice(index, 1);
    await context.saveSettings();

    context.replySuccess(context.__('tag.unoverride.deleted', { name: name.toLowerCase() }));
  }
}

class SearchSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'search',
      aliases: ['find'],
      category: 'misc',
      usage: '<search terms>',
      dm: true,
    });
  }

  async execute(context) {
    const search = context.args.join(' ');
    if (!search || search.length <= 3) return context.replyError(context.__('tag.search.invalidTerms', { count: 3 }));

    const foundTags = await this.client.database.getDocuments('tags', true)
      .then(tags => tags.filter(t => t.id.toLowerCase().includes(search)));
    if (foundTags.length === 0) return context.replyWarning(context.__('tag.search.zeroResult', { search }));

    const msg = [
      context.__('tag.search.results', { search }),
      foundTags.map(t => t.id).join(' '),
    ].join('\n');

    if (msg.length >= 2000) {
      context.reply(
        context.__('tag.search.results', { search }),
        { files: new Attachment(msg, 'found.txt') },
      );
    } else {
      context.reply(msg);
    }
  }
}

class DomainsSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'domains',
      aliases: ['websites'],
      children: [new AddDomainSubcommand(client), new RemoveDomainSubcommand(client)],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const whitelist = await this.client.database.getDocument('bot', 'settings')
      .then(s => s.domainWhitelist);
    if (whitelist.length === 0) return context.replyWarning(context.__('tag.domains.whitelistEmpty'));

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('tag.domains.main'),
      null,
      whitelist.map(w => `${this.dot} ${w}`),
    );
  }
}

class AddDomainSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      category: 'misc',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    if (context.args.length === 0) return context.replyError('You must provide a domain to whitelist.');

    const whitelist = await this.client.database.getDocument('bot', 'settings')
      .then(s => s.domainWhitelist);
    const domain = context.args.join(' ').toLowerCase();

    if (whitelist.includes(domain)) return context.replyWarning(`The domain \`${domain}\` has already been whitelisted.`);
    whitelist.push(domain);
    this.client.database.updateDocument('bot', 'settings', { domainWhitelist: whitelist });

    context.replySuccess(`The domain \`${domain}\` has been whitelisted successfully!`);
  }
}

class RemoveDomainSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      category: 'misc',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    if (context.args.length === 0) return context.replyError('You must provide a domain to remove from the whitelist.');

    const whitelist = await this.client.database.getDocument('bot', 'settings')
      .then(s => s.domainWhitelist);
    const domain = context.args.join(' ').toLowerCase();

    if (!whitelist.includes(domain)) return context.replyWarning(`The domain \`${domain}\` isn't whitelisted.`);
    whitelist.splice(whitelist.indexOf(domain), 1);
    this.client.database.updateDocument('bot', 'settings', { domainWhitelist: whitelist });

    context.replySuccess(`The domain \`${domain}\` has been removed from the whitelist successfully!`);
  }
}

module.exports = TagCommand;
