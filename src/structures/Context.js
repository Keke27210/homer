const mtz = require('moment-timezone');

class Context {
  constructor(client, message) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
    Object.defineProperty(this, 'message', { value: message, enumerable: false });
    this.args = this.message.content.split(/ +/g);
    this.prefix = null;
    this.settings = message.guild
      ? this.client.constants.defaultGuildSettings(message.guild.id)
      : this.client.constants.defaultUserSettings(message.author.id);
  }

  async getSettings() {
    const data = await this.client.database.getDocument('settings', this.message.guild ? this.message.guild.id : this.message.author.id);
    if (data) this.settings = data;
    return true;
  }

  saveSettings() {
    if (Object.is(this.settings, this.message.guild
      ? this.client.constants.defaultGuildSettings(this.message.guild.id)
      : this.client.constants.defaultUserSettings(this.message.author.id))) return;

    return this.client.database.insertDocument('settings', this.settings, { conflict: 'update' });
  }

  reply(content, options) {
    return this.message.channel.send(content, options);
  }

  replySuccess(content, options = {}) {
    return this.reply(`${this.client.constants.emotes.success} ${content}`, options);
  }

  replyWarning(content, options = {}) {
    return this.reply(`${this.client.constants.emotes.warning} ${content}`, options);
  }

  replyError(content, options = {}) {
    return this.reply(`${this.client.constants.emotes.error} ${content}`, options);
  }

  replyLoading(content, options = {}) {
    return this.reply(`${this.client.constants.emotes.loading} ${content}`, options);
  }

  react(emote) {
    return this.message.react(emote);
  }

  reactSuccess() {
    return this.message.react(this.getEmoteID(this.client.constants.emotes.success));
  }

  reactWarning() {
    return this.message.react(this.getEmoteID(this.client.constants.emotes.warning));
  }

  reactError() {
    return this.message.react(this.getEmoteID(this.client.constants.emotes.error));
  }

  reactLoading() {
    return this.message.react(this.getEmoteID(this.client.constants.emotes.loading));
  }

  __(key, args) {
    return this.client.__(this.settings.misc.locale, key, args);
  }

  getEmoteID(emote) {
    return emote.substring(2, (emote.length - 1));
  }

  formatDate(date, format) {
    const time = mtz(date).tz(this.settings.misc.timezone).locale(this.settings.locale);
    if (format) return time.format(format);
 
    if (this.settings.misc.dateTimeLink) {
      return `${time.format(this.settings.misc.dateFormat)} ${this.__('global.at')} ${time.format(this.settings.misc.timeFormat)}`;
    } else {
      return time.format(`${this.settings.misc.dateFormat} ${this.settings.misc.timeFormat}`);
    }
  }

  parseOptions() {
    const words = this.args;
    let title = '';
    const options = [];
    let titleDone = false;

    for (let i = 0; i < words.length; i += 1) {
      const part = words[i];
      if (part.startsWith('-')) {
        titleDone = true;
        options.push({
          name: part.substring(1).toLowerCase(),
          value: '',
        });
      } else if (options.length === 0 && !titleDone) {
        if (title.length === 0) title += part;
        else title += ` ${part}`;
      } else {
        const index = (options.length - 1);
        if (options[index].value.length === 0) {
          options[index].value = part;
        } else {
          options[index].value += ` ${part}`;
        }
      }
    }

    return [title, options];
  }
}

module.exports = Context;
