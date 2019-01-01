const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const rssParser = new (require('rss-parser'))();

class RssCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rss',
      category: 'misc',
      children: [
        new ListSubcommand(client),
        new AddSubcommand(client),
        new RemoveSubcommand(client),
        new AboutSubcommand(client),
      ],
      dm: true,
    });
  }

  async execute(context) {
    context.reply(context.__('rss.main', {
      emote: this.client.constants.emotes.rss,
      command: `${this.client.prefix}rss help`,
    }));
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
    const feeds = await this.client.database.findDocuments('rss', { channel: context.message.channel.id });
    if (feeds.length === 0) return context.replyWarning(context.__('rss.noFeed'));

    const embed = new RichEmbed()
      .setDescription(feeds.map((f, i) => `\`${i + 1}.\` **${f.name}**: \`${f.url}\``).join('\n'))
      .setColor('ORANGE')
      .setFooter(context.__('rss.list.footer'))
      .setTimestamp(new Date());

    context.reply(
      context.__('rss.list.main', {
        emote: this.client.constants.emotes.rss,
        name: context.message.guild ?  `**#${context.channel.name}**` : `**${context.message.author.username}**#${context.message.author.discriminator}`,
      }),
      { embed },
    );
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      category: 'misc',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const name = context.args[0];
    const url = context.args.slice(1).join(' ');
    if (!name || !url) return context.replyError(context.__('rss.add.invalidParams'));

    const feedCount = await this.client.database.provider
      .table('rss')
      .filter({ channel: context.message.channel.id })
      .count();
    if (feedCount >= 5) return context.replyWarning(context.__('rss.add.reachedLimit'));

    const parsed = await rssParser.parseURL(url).catch(() => null);
    if (!parsed) return context.replyWarning(context.__('rss.add.error', { url }));

    await this.client.database.insertDocument({
      name,
      url,
      channel: context.message.channel.id,
      settings: context.message.guild ? context.message.guild.id : context.message.author.id,
      created: Date.now(),
    });

    context.replySuccess(context.__('rss.add.added', { name }));
  }
}

class RemoveSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      aliases: ['delete'],
      category: 'misc',
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async execute(context) {
    const feeds = await this.client.database.findDocuments('rss', { channel: context.message.channel.id });
    if (feeds.length === 0) return context.replyWarning(context.__('rss.noFeed'));

    const index = context.args[0];
    if (!index || Number.isNaN(parseInt(index))) return context.replyError(context.__('rss.remove.invalidIndex'));

    const feed = feeds[index];
    if (!feed) return context.replyError(context.__('rss.remove.notFound', { command: `${this.client.prefix}rss list` }));

    const message = await context.replyWarning(context.__('rss.remove.question', { name: feed.name }));
    for (const e of emotes) await message.react(e);

    message.awaitReactions(
      (reaction, user) => this.emotes.includes(reaction.emoji.name) && user.id === context.message.author.id,
      { max: 1 },
    )
      .then(async (reactions) => {
        const choice = reactions.first().emoji.name;

        if (choice === this.emotes[0]) {
          await this.client.database.deleteDocument('rss', feed.id);
          message.edit(`${this.client.constants.emotes.success} ${context.__('rss.remove.removed', { name: feed.name })}`);
        } else {
          message.edit(`${this.client.constants.emotes.error} ${context.__('rss.remove.cancelled', { name: feed.name })}`);
        }
      });
  }

  get emotes() {
    return [this.client.constants.emotes.success, this.client.constants.emotes.error];
  }
}

class AboutSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'about',
      aliases: ['info'],
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const information = Object.keys(this.client.localization.locales['en-gb'])
      .filter(key => key.startsWith('rss.about.info.'));

    const embed = new RichEmbed()
      .setDescription(information.map(i => `${this.dot} ${context.__(i)}`))
      .setColor('ORANGE');

    context.reply(context.__('rss.about.main', {
      emote: this.client.constants.emotes.rss,
    }), { embed });
  }
}

module.exports = RssCommand;
