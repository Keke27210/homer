const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

const Command = require('../../structures/Command');

class NowCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'now',
      aliases: ['np', 'nowplaying'],
    });

    this.interval = 3e3;
    this.timeout = (10 * 60e3) / this.interval;
    this.cooldown = new Set();
  }

  async main(message) {
    if (this.cooldown.has(message.guild.id)) {
      message.warn(message._('global.cooldown'));
      return 0;
    }

    let player = this.client.lavacordManager.players.get(message.guild.id);
    if (!player) {
      message.error(message._('now.noSession'));
      return 0;
    }

    let radio = await this.client.radios.getRow(player.radio);
    let now = await this.client.radios.nowPlaying(radio.id)
      .then((n) => (n ? n.split('-') : [message._('now.noInformation')]));


    let index = 0;
    const display = this.constructor.getDisplay(
      message,
      radio,
      now,
      index,
      message.settings.volume,
    );

    const embed = new MessageEmbed()
      .setDescription(display)
      .setFooter(message._('now.footer'));
    const m = await message.send(message._('now.title'), embed);

    this.cooldown.add(message.guild.id);
    const interval = this.client.setInterval(async () => {
      player = this.client.lavacordManager.players.get(message.guild.id);
      if (index > this.timeout || !player) {
        if (this.cooldown.has(message.guild.id)) this.cooldown.delete(message.guild.id);
        return this.client.clearInterval(interval);
      }
      if (player.radio !== radio.id) {
        index = 0;
        radio = await this.client.radios.getRow(player.radio);
        if (!radio) {
          if (this.cooldown.has(message.guild.id)) this.cooldown.delete(message.guild.id);
          return this.client.clearInterval(interval);
        }
      }
      if (index % now.length === 0) {
        now = await this.client.radios.nowPlaying(radio.id)
          .then((n) => {
            if (!n) return [message._('now.noInformation')];
            const a = n.split('-');
            for (let i = 0; i < a.length; i += 1) {
              if (a[i].length > 17) a[i] = a[i].match(/(.{1,17})(?:\s|$)/g);
            }
            return a.flat();
          });
      }
      index += 1;
      const newDisplay = this.constructor.getDisplay(
        message,
        radio,
        now,
        (index % now.length),
        message.settings.volume,
      );
      return m.edit(message._('now.title'), { embed: embed.setDescription(newDisplay) })
        .catch(() => {
          if (this.cooldown.has(message.guild.id)) this.cooldown.delete(message.guild.id);
          this.client.clearInterval(interval);
        });
    }, this.interval);

    return 0;
  }

  /**
   * Returns a neat display for radio information
   * @param {Message} message Message to get emotes from
   * @param {Radio} radio Radio
   * @param {Now} now Playing information
   * @param {number} index Index for playing info
   * @param {number} volume Radio volume
   * @returns {string}
   */
  static getDisplay(message, { frequency, ps }, now, index, volume) {
    const output = [];

    // 1- _FREQUENCY___PS__
    let line = message.emote('off', true).repeat(frequency.length < 5 ? 2 : 1);
    for (let i = 0; i < frequency.length; i += 1) {
      if (frequency[i] === '.') continue;
      line += message.emote(`digit_${frequency[i]}${frequency[i + 1] === '.' ? 'd' : ''}`, true);
    }

    line += message.emote('off', true).repeat(3);

    // PS
    for (let i = 0; i < ps.length; i += 1) {
      if (ps[i] === '¤') line += message.emote('off', true);
      else {
        const number = parseInt(ps[i], 10);
        if (!Number.isNaN(number)) line += message.emote(`digit_${ps[i]}`, true);
        else line += message.emote(`letter_${ps[i].toLowerCase()}`, true);
      }
    }

    line += message.emote('off', true);
    output.push(line);

    // 2- Playing Information
    let line2 = '';
    let infoLine = now[index];
    infoLine = infoLine
      .trim()
      .replace(/ +/g, '¤')
      .padStart(infoLine.length + Math.floor((17 - infoLine.length) / 2), '¤')
      .padEnd(17, '¤');
    for (let i = 0; i < 17; i += 1) {
      const e = ['char', 'digit', 'letter'].map((t) => message.emote(`${t}_${infoLine[i]}`, true));
      if (e[0]) line2 += e[0];
      else if (e[1]) line2 += e[1];
      else if (e[2]) line2 += e[2];
      else line2 += message.emote('off', true);
    }
    output.push(line2);

    // 3- BLANK LINE
    output.push(message.emote('off', true).repeat(17));

    // 4- Volume
    let line3 = ['v', 'o', 'l', 'u', 'm', 'e'].map((c) => message.emote(`letter_${c}`, true)).join('') + message.emote('off', true);
    const volLevel = Math.ceil(volume / 10);
    line3 += message.emote('letter_x', true).repeat(volLevel) + message.emote('char_-', true).repeat(10 - volLevel);
    output.push(line3);

    // 5- Hour
    let line4 = message.emote('off', true).repeat(6);
    const hr = moment().tz(message.settings.timezone).format('HH:mm');
    for (let i = 0; i < hr.length; i += 1) line4 += message.emote(hr[i] === ':' ? 'char_:' : `digit_${hr[i]}`, true);
    line4 += message.emote('off', true).repeat(6);
    output.push(line4);

    return output.join('\n');
  }
}

module.exports = NowCommand;
