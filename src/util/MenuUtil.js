const { MessageEmbed } = require('discord.js');

const Util = require('./Util');

const emotes = {
  '⏪': () => 0,
  '◀': (total, n) => ((n - 1) < 0 ? (total - 1) : (n - 1)),
  '⏹': () => -1,
  '▶': (total, n) => ((n + 1) === total ? 0 : (n + 1)),
  '⏩': (total) => (total - 1),
};

class MenuUtil extends Util {
  constructor(client) {
    super(client);

    /**
     * Active menus
     * @type {Menu[]}
     */
    this.menus = [];

    this.client.setInterval(() => this.cleanExpired(), (60 * 1000));
  }

  /**
   * Calls LocaleManager#translate
   * @param {string} locale Locale
   * @param {string} key Translation key
   * @param  {...any} args Arguments
   */
  _(locale, key, ...args) {
    return this.client.localeManager.translate(locale, key, ...args);
  }

  /**
   * Removes outdated menus from the list
   */
  cleanExpired() {
    this.menus
      .filter((i) => (i.time + i.options.timeout) < Date.now())
      .forEach((i) => {
        this.menus.splice(this.menus.indexOf(i), 1);
        this.cleanReactions(i);
      });
  }

  /**
   * Clean bot reactions from a menu instance
   * @param {object} instance Menu instance
   */
  async cleanReactions(instance) {
    const channel = this.client.channels.resolve(instance.channel);
    if (!channel) return;

    const message = await channel.messages.fetch(instance.message)
      .catch(() => null);
    if (!message) return;

    const queue = message.reactions.cache.array();
    for (let i = 0; i < queue.length; i += 1) {
      if (!queue[i].me) continue;
      await queue[i].users.remove();
    }
  }

  /**
   * Parses menu entries
   * @param {string[]} raw Raw entries
   * @param {number} entriesPerPage Entries per page
   * @static
   * @returns {string[][]} Parsed entries
   */
  static parseEntries(raw, entriesPerPage) {
    const entries = [];
    const count = Math.ceil(raw.length / entriesPerPage);
    for (let i = 0; i < count; i += 1) {
      const page = [];
      for (let j = 0; j < entriesPerPage; j += 1) {
        page.push(raw.shift());
      }
      entries.push(page.join('\n'));
    }
    return entries;
  }

  /**
   * Parses options for the menu
   * @param {object} options Menu options
   * @static
   * @returns {object} Menu options
   */
  static parseOptions(options) {
    return ({
      entriesPerPage: options.entriesPerPage || 10,
      footer: options.footer || null,
      timeout: options.timeout || (30 * 60 * 1000),
    });
  }

  /**
   * Creates an instance of menu
   * @param {string} channel Channel ID
   * @param {string} author Author ID
   * @param {string} origin Command message ID
   * @param {string} locale Locale
   * @param {string} content Message content
   * @param {object} pages Page settings
   * @param {string[][]} entries Menu entries
   * @param {object} options Menu options
   */
  async createMenu(channel, author, origin, locale, content, pages, entries, options = {}) {
    const instance = {
      channel,
      author,
      origin,
      locale,
      content,
      options: this.constructor.parseOptions(options),
      pages: pages || [],
      current: 0,
      time: Date.now(),
    };

    instance.entries = this.constructor.parseEntries(entries, instance.options.entriesPerPage);
    const embed = this.generateEmbed(instance);

    const target = await this.client.channels.fetch(instance.channel);
    if (!target) return;

    const message = await target.send(instance.content, embed);
    if (instance.entries.length > 1) {
      (async function react() {
        const reactions = Object.keys(emotes);
        for (let i = 0; i < reactions.length; i += 1) {
          try {
            await message.react(reactions[i]);
          } catch {
            break;
          }
        }
      }());
    }

    instance.message = message.id;
    this.menus.push(instance);
  }

  /**
   * Updates a menu message
   * @param {Menu} instance Menu instance
   */
  async updateMenu(instance) {
    const message = await this.client.channels
      .resolve(instance.channel)
      .messages.fetch(instance.message);
    message.edit(message.content, this.generateEmbed(instance));
  }

  /**
   * Deletes a menu message
   * @param {Menu} instance Menu instance
   */
  async deleteMenu(instance) {
    const message = await this.client.channels
      .resolve(instance.channel)
      .messages.fetch(instance.message);
    message.delete();

    if (!instance.origin) return;
    const origin = await this.client.channels
      .resolve(instance.channel)
      .messages.fetch(instance.origin)
      .catch(() => null);
    if (!origin) return;

    if (!origin.guild) return;
    const permission = this.client.channels
      .resolve(instance.channel)
      .permissionsFor(this.client.user)
      .has('MANAGE_MESSAGES');
    if (permission) origin.delete();
  }

  /**
   * Handles a reaction
   * @param {MessageReaction} reaction Reaction
   * @param {User} user User
   */
  handleReaction(reaction, user) {
    const instance = this.menus.find((i) => i.message === reaction.message.id);
    if (!instance) return;

    if (instance.author !== user.id) return;

    const page = emotes[reaction.emoji.name](instance.entries.length, instance.current);
    if (page === -1) {
      this.deleteMenu(instance);
      return;
    }

    if (reaction.message.guild && reaction.message.guild.me.permissions.has('MANAGE_MESSAGES')) {
      reaction.users.remove(user.id);
    }

    const index = this.menus.indexOf(instance);
    this.menus[index].current = page;

    this.updateMenu(this.menus[index]);
  }

  /**
   * Generates an embed for a menu
   * @param {object} instance Menu instance
   * @returns {MessageEmbed} Embed
   */
  generateEmbed(instance) {
    const {
      pages,
      current,
      locale,
      options,
    } = instance;

    const embed = new MessageEmbed()
      .setTitle(this._(locale, 'menu.page', current + 1))
      .setDescription(instance.entries[current]);

    if (Array.isArray(options.footer)) {
      embed.setFooter(options.footer[0], options.footer[1]);
    } else {
      embed.setFooter(this._(locale, 'menu.page', `${current + 1}/${instance.entries.length}`));
    }

    if (pages[current]) {
      if (pages[current].title) embed.setTitle(pages[current].title);
      if (pages[current].footer) {
        if (Array.isArray(pages[current].footer)) {
          embed.setFooter(pages[current].footer[0], pages[current].footer[1]);
        } else embed.setFooter(pages[current].footer);
      }
      if (pages[current].image) embed.setImage(pages[current].image);
      if (pages[current].thumbnail) embed.setThumbnail(pages[current].thumbnail);
      if (pages[current].color) embed.setColor(pages[current].color);
      if (pages[current].url) embed.setURL(pages[current].url);
      if (pages[current].timestamp) embed.setTimestamp(pages[current].timestamp);
    }

    return embed;
  }
}

module.exports = MenuUtil;
