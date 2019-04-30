const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const request = require('superagent');
const parser = require('fast-xml-parser');

class Rule34Command extends Command {
  constructor(client) {
    super(client, {
      name: 'rule34',
      aliases: ['r34'],
      usage: '[search or "random"]',
      category: 'porn',
      dm: true,
    });
  }

  async execute(context) {
    if (context.message.guild && !context.message.channel.nsfw) return context.replyError(context.__('porn.nonNsfw'));
    if (!context.settings.ageVerification) {
      const age = await this.client.other.ageVerification(context);
      if (!age) return; // Timeout or ❌ => Stop here
    }

    const message = await context.replyLoading(context.__('global.loading'));
    const search = context.args.join(' ');
    if (search.length > 128) return context.replyWarning(context.__('porn.searchTooLong'));
    if (!search || search.toLowerCase() === 'random') {
      const data = await request
        .get('https://rule34.xxx/index.php?page=dapi&s=post&q=index')
        .then(r => parser.parse(r.text, { attributeNamePrefix: '_', ignoreAttributes: false }).posts.post)
        .catch(() => null);
      if (!data) return message.edit(`${this.client.constants.emotes.warning} ${context.__('porn.fetchError')}`);

      // List them all
      if (!search) {
        const pages = [];
        const entries = [];
        for (const item of data) {
          entries.push('');
          pages.push({
            title: context.__('porn.source'),
            url: item._source,
            image: item._file_url,
            time: new Date(item._created_at),
          });
        }

        message.delete();
        this.client.menu.createMenu(
          context.message.channel.id,
          context.message.author.id,
          context.message.id,
          context.settings.misc.locale,
          context.__('rule34.titleAll'),
          pages,
          entries,
          { entriesPerPage: 1 },
        );
      } else {
        // Random item
        const random = data[Math.floor(Math.random() * data.length)];
        const embed = new RichEmbed()
          .setTitle(context.__('rule34.source'))
          .setImage(random._file_url)
          .setURL(random._source)
          .setTimestamp(new Date(random._created_at));
        message.edit(context.__('rule34.titleRandom'), { embed });
      }
    } else {
      // With search
      const data = await request
        .get(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(search)}`)
        .then(r => parser.parse(r.text, { attributeNamePrefix: '_', ignoreAttributes: false }).posts.post)
        .catch(() => null);
      if (!data) return message.edit(`${this.client.constants.emotes.warning} ${context.__('porn.fetchError')}`);

      const pages = [];
      const entries = [];
      for (const item of data) {
        entries.push('');
        pages.push({
          title: context.__('porn.source'),
          url: item._source,
          image: item._file_url,
          time: new Date(item._created_at),
        });
      }

      message.delete();
      this.client.menu.createMenu(
        context.message.channel.id,
        context.message.author.id,
        context.message.id,
        context.settings.misc.locale,
        context.__('rule34.titleSearch', { search }),
        pages,
        entries,
        { entriesPerPage: 1 },
      );
    }
  }
}

module.exports = Rule34Command;
