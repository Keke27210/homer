const Manager = require('../structures/Manager');
const { RichEmbed } = require('discord.js');

const emotes = {
  '⏪': () => 0,
  '◀': (total, n) => (n - 1) < 0 ? (total - 1) : (n - 1),
  '⏹': () => -1,
  '▶': (total, n) => (n + 1) === total ? 0 : (n + 1),
  '⏩': total => (total - 1),
};

class MenuManager extends Manager {
  constructor(client) {
    super(client);

    this.instances = [];
    this.client.setInterval(() => this._cleanExpired(), 60000);
  }

  __(lang, key, args) {
    return this.client.__(lang, key, args);
  }

  _parseOptions(options) {
    return ({
      entriesPerPage: options.entriesPerPage || 10,
      footer: options.footer || null,
      timeout: options.timeout || 1800000, // in ms (default: 30 minutes)
    });
  }

  _parseEntries(entries, entriesPerPage) {
    const parsedEntries = [];
    const pageCount = Math.ceil(entries.length / entriesPerPage);
    for (let i = 0; i < pageCount; i += 1) {
      const thisPage = [];
      for (let j = 0; j < entriesPerPage; j += 1) {
        const d = entries[j];
        if (d) thisPage.push(d);
      }
      parsedEntries.push(thisPage.join('\n'));
      entries = entries.slice(entriesPerPage);
    }
    return parsedEntries;
  }

  _cleanExpired() {
    this.instances
      .filter(i => (i.time + i.options.timeout) < Date.now())
      .forEach((i) => {
        this.instances.splice(this.instances.indexOf(i), 1);
        this._cleanReactions(i);
      });
  }

  _cleanReactions(i) {
    const message = this.client.channels.get(i.channel).fetchMessage(i.message);
    message.reactions
      .filter(r => r.me)
      .forEach(r => r.remove());
  }

  async createMenu(channel, author, authorMessage, lang, content, pages, entries, options = {}) {
    options = this._parseOptions(options);
    entries = this._parseEntries(entries, options.entriesPerPage);

    const instance = ({
      channel,
      author,
      authorMessage,
      entries,
      pages: pages || [],
      options,
      lang,
      currentPage: 0,
      time: Date.now(),
    });

    const generatedEmbed = this.generateEmbed(instance);
    const sentMessage = await this.client.channels.get(instance.channel).send(content, { embed: generatedEmbed });

    (async function () {
      const reactions = Object.keys(emotes);
      for (let i = 0; i < reactions.length; i += 1) await sentMessage.react(reactions[i]);
    })();

    instance.message = sentMessage.id;
    this.instances.push(instance);
  }

  handleReaction(reaction, user) {
    const instance = this.instances.find(i => i.message === reaction.message.id);
    if (!instance) return;
    if (user.id !== instance.author) return;

    const newPage = emotes[reaction.emoji.name](instance.entries.length, instance.currentPage);
    if (newPage === -1) return this.stopMenu(instance);

    instance.currentPage = newPage;
    this.instances[this.instances.findIndex(i => i.message === reaction.message.id)].currentPage = newPage;
    return this.updateMenu(instance);
  }

  async updateMenu(instance) {
    const message = await this.client.channels.get(instance.channel).fetchMessage(instance.message);
    const generatedEmbed = this.generateEmbed(instance);
    return message.edit(message.content, { embed: generatedEmbed });
  }

  async stopMenu(instance) {
    const message = await this.client.channels.get(instance.channel).fetchMessage(instance.message);
    message.delete();
    this.instances.splice(this.instances.indexOf(instance), 1);

    // Trying to delete author's message
    const authorMessage = await this.client.channels.get(instance.channel).fetchMessage(instance.authorMessage)
      .catch(() => null);
    if (!authorMessage) return;

    if (!authorMessage.guild) return;
    const deletePermission = this.client.channels.get(instance.channel).permissionsFor(this.client.user).has('MANAGE_MESSAGES');
    if (deletePermission) authorMessage.delete();
  }

  generateEmbed(instance) {
    const { pages, currentPage, lang } = instance;

    const embed = new RichEmbed()
      .setTitle(pages[currentPage] && pages[currentPage].title ? pages[currentPage].title : this.__(lang, 'global.page', { num: (currentPage + 1) }))
      .setDescription(instance.entries[currentPage])
      .setFooter(pages[currentPage] && pages[currentPage].footer ?
        pages[currentPage].footer :
        (instance.options.footer || this.__(lang, 'global.page', { num: `${currentPage + 1}/${instance.entries.length}` })))
      .setColor(pages[currentPage] && pages[currentPage].color ? pages[currentPage].color : undefined)
      .setThumbnail(pages[currentPage] && pages[currentPage].thumb ? pages[currentPage].thumb : undefined);

    return embed;
  }
}

module.exports = MenuManager;
