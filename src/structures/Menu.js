const { RichEmbed, Util } = require('discord.js');

class Menu {
  constructor(context, data, options = {}) {
    Object.defineProperty(this, 'context', { value: context, enumerable: false });
    this.titles = options.titles || [];
    this.pages = [];
    this.thumbnails = options.thumbnails || [];
    this.footer = options.footer;
    this.options = Util.mergeDefault({
      entriesPerPage: 10,
    }, options);
    this.menuMessage = null;
    this.currentPage = 0;

    this._patch(data);
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
    const pageNum = Math.ceil(data.length / this.options.entriesPerPage);
    for (let i = 0; i < pageNum; i += 1) {
      const thisPage = [];
      for (let j = 0; j < this.options.entriesPerPage; j += 1) {
        const d = data[j];
        if (d) thisPage.push(d);
      }
      this.pages.push(thisPage.join('\n'));
      data = data.slice(this.options.entriesPerPage);
    }
  }

  send(content, options = {}) {
    const embed = new RichEmbed()
      .setTitle(this.titles[this.currentPage] || this.context.__('global.page', { num: (this.currentPage + 1) }))
      .setDescription(this.pages[this.currentPage])
      .setFooter(this.footer || this.context.__('global.page', { num: `${this.currentPage + 1}/${this.pages.length}` }))
      .setThumbnail(this.thumbnails[this.currentPage]);

    options.embed = embed;
    return this.context.message.channel.send(content, options).then(async (m) => {
      this.menuMessage = m;

      for (const e of this.emotes) await m.react(e);
      const collector = m.createReactionCollector(
        (reaction, user) => this.emotes.includes(reaction.emoji.name) && user.id === this.context.message.author.id,
        {
          time: 300000,
        },
      );

      collector.on('collect', (reaction) => {
        const p = this.context.message.guild ?
          this.context.message.channel.permissionsFor(this.context.client.user) :
          null;
        if (p && p.has('MANAGE_MESSAGES')) reaction.remove(this.context.message.author.id);

        if (reaction.emoji.name === '⏹') {
          return collector.stop();
        }

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

        if (this.currentPage < 0) this.currentPage = (this.pages.length - 1);
        if (this.currentPage > (this.pages.length - 1)) this.currentPage = 0;
        if (tmpNum !== this.currentPage) this.refreshMenu();
      });

      collector.once('end', async (reason) => {
        if (reason === 'time') {
          try { await this.menuMessage.clearReactions(); } catch (e) {}
        } else {
          try { await this.menuMessage.delete(); } catch(e) {}
          try { await this.context.message.delete(); } catch(e) {}
        }
      });
    });
  }

  refreshMenu() {
    const embed = new RichEmbed()
      .setTitle(this.titles[this.currentPage] || this.context.__('global.page', { num: (this.currentPage + 1) }))
      .setDescription(this.pages[this.currentPage])
      .setFooter(this.footer || this.context.__('global.page', { num: `${this.currentPage + 1}/${this.pages.length}` }))
      .setThumbnail(this.thumbnails[this.currentPage]);

    this.menuMessage.edit(this.menuMessage.content, { embed }).then((m) => {
      this.menuMessage = m;
    });
  }
}

module.exports = Menu;
