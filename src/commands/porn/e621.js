const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const request = require('superagent');

class E621Command extends Command {
  constructor(client) {
    super(client, {
      name: 'e621',
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
        .get('https://e621.net/post/index.json?limit=100')
        .then(r => r.body.filter(d => d.tags.includes('cub')))
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
            url: item.source || `https://e621.net/post/show/${item.id}`,
            image: item.file_url,
            time: new Date(item.created_at.s * 1000),
            footer: context.__('porn.author', { author: item.author }),
          });
        }

        message.delete();
        this.client.menu.createMenu(
          context.message.channel.id,
          context.message.author.id,
          context.message.id,
          context.settings.misc.locale,
          context.__('e621.titleAll'),
          pages,
          entries,
          { entriesPerPage: 1 },
        );
      } else {
        // Random item
        const random = data[Math.floor(Math.random() * data.length)];
        const embed = new RichEmbed()
          .setTitle(context.__('e621.source'))
          .setImage(random.file_url)
          .setURL(random.source || `https://e621.net/post/show/${random.id}`)
          .setTimestamp(new Date(random.created_at.s * 1000));
        message.edit(context.__('e621.titleRandom'), { embed });
      }
    } else {
      // With search
      const data = await request
        .get(`https://e621.net/post/index.json?limit=100&tags=${encodeURIComponent(search)}`)
        .then(r => r.body.filter(d => d.tags.includes('cub')))
        .catch(() => null);
      if (!data) return message.edit(`${this.client.constants.emotes.warning} ${context.__('porn.fetchError')}`);

      const pages = [];
      const entries = [];
      for (const item of data) {
        entries.push('');
        pages.push({
          title: context.__('porn.source'),
          url: item.source || `https://e621.net/post/show/${item.id}`,
          image: item.file_url,
          time: new Date(item.created_at.s * 1000),
        });
      }

      message.delete();
      this.client.menu.createMenu(
        context.message.channel.id,
        context.message.author.id,
        context.message.id,
        context.settings.misc.locale,
        context.__('e621.titleSearch', { search }),
        pages,
        entries,
        { entriesPerPage: 1 },
      );
    }
  }
}

module.exports = E621Command;
