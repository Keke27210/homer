const Command = require('../../structures/Command');

// tag->create
class CreateSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'create',
      dm: true,
    });
  }

  async main(message, args) {
    const name = args.shift();
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    if (name.length > this.client.tags.nameLength) {
      message.error(message._('tag.create.nlength', this.client.tags.nameLength));
      return 0;
    }

    const existing = await this.client.tags.getTag(name);
    if (existing) {
      message.warn(message._('tag.exists', existing.name));
      return 0;
    }

    const content = args.join(' ');
    if (!content) {
      message.error(message._('tag.content'));
      return 0;
    }

    if (content.length > this.client.tags.maxLength) {
      message.warn(message._('tag.create.length', this.client.tags.maxLength));
      return 0;
    }

    const ret = await this.client.tags.createTag(
      name,
      content,
      message.author.id,
    )
      .then(() => {
        message.success(message._('tag.create.created', name.toLowerCase()));
        return 0;
      })
      .catch((error) => {
        message.error(message._('tag.create.error'));
        this.client.logger.error(`[tags->create] Error while creating tag "${name}"`, error);
        return 1;
      });

    return ret;
  }
}

// tag->edit
class EditSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'edit',
      dm: true,
    });
  }

  async main(message, args) {
    const name = args.shift();
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    const existing = await this.client.tags.getTag(name);
    if (!existing) {
      message.warn(message._('tag.unknown', name));
      return 0;
    }

    if (message.author.id !== existing.author && !this.client.owners.includes(message.author.id)) {
      message.warn(message._('tag.edit.cannot', existing.name));
      return 0;
    }

    const content = args.join(' ');
    if (!content) {
      message.error(message._('tag.content'));
      return 0;
    }

    if (content.length > this.client.tags.maxLength) {
      message.warn(message._('tag.edit.length', this.client.tags.maxLength));
      return 0;
    }

    const ret = await this.client.tags.editTag(
      existing.id,
      content,
    )
      .then(() => {
        message.success(message._('tag.edit.edited', existing.name));
        return 0;
      })
      .catch((error) => {
        message.error(message._('tag.edit.error'));
        this.client.logger.error(`[tags->edit] Error while editing tag "${existing.name}" (${existing.id})`, error);
        return 1;
      });

    return ret;
  }
}

// tag->delete
class DeleteSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'delete',
      dm: true,
    });
  }

  async main(message, args) {
    const name = args.shift();
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    const existing = await this.client.tags.getTag(name);
    if (!existing) {
      message.warn(message._('tag.unknown', name.toLowerCase()));
      return 0;
    }

    if (message.author.id !== existing.author && !this.client.owners.includes(message.author.id)) {
      message.warn(message._('tag.delete.cannot', existing.name));
      return 0;
    }

    const ret = await this.client.tags.deleteTag(existing.id)
      .then(() => {
        message.success(message._('tag.delete.deleted', existing.name));
        return 0;
      })
      .catch((error) => {
        message.error(message._('tag.delete.error'));
        this.client.logger.error(`[tags->delete] Error while deleting tag "${existing.name}" (${existing.id})`, error);
        return 1;
      });

    return ret;
  }
}

// tag->list
class ListSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'list',
      dm: true,
    });
  }

  async main(message, args) {
    const search = args.join(' ');
    let { member } = message;
    let user = message.author;
    if (message.guild && search) {
      const found = await this.client.finderUtil.findMembers(message, search);
      if (!found) {
        message.error(message._('finder.members.zero', search));
        return 0;
      }
      if (found.length > 1) {
        message.warn(this.client.finderUtil.formatMembers(message, found, search));
        return 0;
      }
      [member] = found;
      user = member.user;
    }

    const conditions = [
      ['author', '=', user.id],
    ];
    if (user.id !== message.author.id) conditions.push(['private', '=', false]);

    const tags = await this.client.tags.getRows(conditions);
    if (!tags.length) {
      message.info(message._('tag.list.none', user.tag));
      return 0;
    }

    message.send(message._('tag.list.title', user.tag, tags.map((t) => t.name).join(' ')));
    return 0;
  }
}

// tag->owner
class OwnerSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'owner',
      dm: true,
    });
  }

  async main(message, args) {
    const [name] = args;
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    const tag = await this.client.tags.getTag(name);
    if (!tag || (!tag.active && message.author.id !== tag.author)) {
      message.error(message._('tag.unknown', name));
      return 0;
    }

    const user = await this.client.users.fetch(tag.author)
      .catch(() => null);

    message.send(message._('tag.owner',
      tag.name,
      user ? ({ user: user.tag, id: user.id }) : null));
    return 0;
  }
}

// tag->raw
class RawSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'raw',
      dm: true,
    });
  }

  async main(message, args) {
    const [name] = args;
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    const tag = await this.client.tags.getTag(name);
    if (!tag || ((!tag.active || !tag.source) && message.author.id !== tag.author)) {
      message.error(message._('tag.unknown', name));
      return 0;
    }

    message.send(tag.content);
    return 0;
  }
}

// tag->raw2
class Raw2Subcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'raw2',
      dm: true,
    });
  }

  async main(message, args) {
    const [name] = args;
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    const tag = await this.client.tags.getTag(name);
    if (!tag || ((!tag.active || !tag.source) && message.author.id !== tag.author)) {
      message.error(message._('tag.unknown', name));
      return 0;
    }

    message.send(tag.content, { code: true });
    return 0;
  }
}

// tag->private
class PrivateSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'private',
      dm: true,
    });
  }

  async main(message, args) {
    const [name] = args;
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    const tag = await this.client.tags.getTag(name);
    if (!tag) {
      message.error(message._('tag.unknown', name));
      return 0;
    }

    if (message.author.id !== tag.author && !this.client.owners.includes(message.author.id)) {
      message.error(message._('tag.permissions', tag.name));
      return 0;
    }

    const ret = await this.client.tags.activateTag(tag.id)
      .then((state) => {
        if (state) message.success(message._('tag.private.activated', tag.name));
        else message.success(message._('tag.private.deactivated', tag.name));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[tag->private] An error occured while activating tag "${tag.name}" (${tag.id})`, error);
        message.error(message._('tag.private.error'));
        return 1;
      });

    return ret;
  }
}

// tag->source
class SourceSubcommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'source',
      dm: true,
    });
  }

  async main(message, args) {
    const [name] = args;
    if (!name) {
      message.error(message._('tag.missing'));
      return 0;
    }

    const tag = await this.client.tags.getTag(name);
    if (!tag) {
      message.error(message._('tag.unknown', name));
      return 0;
    }

    if (message.author.id !== tag.author && !this.client.owners.includes(message.author.id)) {
      message.error(message._('tag.permissions', tag.name));
      return 0;
    }

    const ret = await this.client.tags.sourceTag(tag.id)
      .then((state) => {
        if (state) message.success(message._('tag.source.public', tag.name));
        else message.success(message._('tag.source.private', tag.name));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[tag->source] An error occured while publishing/unpublishing tag "${tag.name}" (${tag.id})`, error);
        message.error(message._('tag.source.error'));
        return 1;
      });

    return ret;
  }
}

class TagCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'tag',
      aliases: ['t'],
      children: [
        new CreateSubcommand(client, category),
        new EditSubcommand(client, category),
        new DeleteSubcommand(client, category),
        new ListSubcommand(client, category),
        new OwnerSubcommand(client, category),
        new RawSubcommand(client, category),
        new Raw2Subcommand(client, category),
        new PrivateSubcommand(client, category),
        new SourceSubcommand(client, category),
      ],
      dm: true,
    });
  }

  async main(message, args) {
    const name = args.shift();
    if (!name) return message.error(message._('tag.missing'));

    const tag = await this.client.tags.getTag(name);
    if (!tag || (!tag.active && message.author.id !== tag.author)) {
      message.error(message._('tag.unknown', name));
      return 0;
    }

    const m = await message.loading(message._('global.loading'));
    let processed = false;
    this.client.setTimeout(() => {
      if (!processed) m.editError(message._('tag.error'));
    }, 10000);

    const parsed = await this.client.lisaManager.parseString(
      message,
      tag.content,
      'tag',
      args,
    );
    processed = true;

    m.edit(parsed.content
      ? parsed.content.replace(/@everyone/g, '!EVERYONE').replace(/@here/g, '!HERE')
      : '', {
      embed: parsed.embed,
    })
      .catch((error) => {
        m.editError(message._('tag.api', error.message));
      });

    return 0;
  }
}

module.exports = TagCommand;
