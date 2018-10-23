const { RichEmbed } = require('discord.js');

class Menu {
  constructor(context, data, options = {}) {
    Object.defineProperty(this, 'context', { value: context, enumerable: false });
    this.menuMessage = null;

    // Menu content
    this.titles = options.titles || [];
    this.pages = [];
    this.thumbnails = options.thumbnails || [];
    this.footer = options.footer;
    this.entriesPerPage = options.entriesPerPage || 10;

    // Filling the pages
    this.currentPage = 0;
    this._patch(data);
    

    // Prebuilding the embed
    this.embed = new RichEmbed()
      .setTitle(this.titles[this.currentPage] || this.context.__('global.page', { num: (this.currentPage + 1) }))
      .setDescription(this.pages[this.currentPage])
      .setFooter(this.footer || this.context.__('global.page', { num: `${this.currentPage + 1}/${this.pages.length}` }))
      .setThumbnail(this.thumbnails[this.currentPage]);
  }

  get emotes() {
    return [
      '⏪',
      '◀',
      '⏹',
      '▶',
      '⏩',
    ];
  }

  _patch(data) {
    const pageNum = Math.ceil(data.length / this.entriesPerPage);
    for (let i = 0; i < pageNum; i += 1) {
      const thisPage = [];
      for (let j = 0; j < this.entriesPerPage; j += 1) {
        const d = data[j];
        if (d) thisPage.push(d);
      }
      this.pages.push(thisPage.join('\n'));
      data = data.slice(this.entriesPerPage);
    }
  }

  send(content, options = {}) {
    options.embed = this.embed;

    this.context.message.channel.send(content, options).then(async (m) => {
      this.menuMessage = m;

      for (const e of this.emotes) await m.react(e);
      const collector = m.createReactionCollector(
        (reaction, user) => this.emotes.includes(reaction.emoji.name) && user.id === this.context.message.author.id,
        {
          time: 300000,
        },
      );

      collector.on('collect', (reaction) => {
        if (reaction.emoji.name === '⏹') return collector.stop('push');

        const tmpNum = this.currentPage;
        if (reaction.emoji.name === '⏪') {
          this.currentPage = 0;
        } else if (reaction.emoji.name === '◀') {
          this.currentPage -= 1;
        } else if (reaction.emoji.name === '▶') {
          this.currentPage += 1;
        } else if (reaction.emoji.name === '⏩') {
          this.currentPage = (this.pages.length - 1);
        }

        reaction.remove(this.context.message.author.id).catch(() => null);
        if (this.currentPage < 0) this.currentPage = (this.pages.length - 1);
        if (this.currentPage > (this.pages.length - 1)) this.currentPage = 0;
        if (tmpNum !== this.currentPage) this.refreshMenu();
      });

      collector.once('end', (reason) => {
        if (reason === 'push') {
          this.menuMessage.delete();
          this.context.message.delete().catch(() => null);
        } else {
          this.menuMessage.reactions
            .filter(r => r.me)
            .forEach(r => r.remove());
        }
      });
    });
  }

  refreshMenu() {
    this.embed
      .setTitle(this.titles[this.currentPage] || this.context.__('global.page', { num: (this.currentPage + 1) }))
      .setDescription(this.pages[this.currentPage])
      .setFooter(this.footer || this.context.__('global.page', { num: `${this.currentPage + 1}/${this.pages.length}` }))
      .setThumbnail(this.thumbnails[this.currentPage]);

    this.menuMessage.edit(this.menuMessage.content, { embed })
      .then((m) => { this.menuMessage = m; });
  }
}

module.exports = Menu;
