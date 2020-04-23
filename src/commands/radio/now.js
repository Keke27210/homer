const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

const Command = require('../../structures/Command');

class NowCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'now',
      aliases: ['np', 'nowplaying'],
    });
  }

  async main(message) {
    const player = this.client.lavacordManager.players.get(message.guild.id);
    if (!player) {
      message.error(message._('now.noSession'));
      return 0;
    }

    const radio = await this.client.radios.getRow(player.radio);
    const now = await this.client.radios.nowPlaying(radio.id)
      .then((n) => (n ? n.split('-') : [message.emote('now.noInformation')]));

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

    if (now.length > 1) {
      const interval = this.client.setInterval(() => {
        if (index > 20) return this.client.clearInterval(interval);
        index += 1;
        const newDisplay = this.constructor.getDisplay(
          message,
          radio,
          now,
          (index % now.length),
          message.settings.volume,
        );
        return m.edit(message._('now.title'), { embed: embed.setDescription(newDisplay) });
      }, 3000);
    }

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
    let line = message.emote('letter_none', true).repeat(frequency.length < 5 ? 2 : 1);
    for (let i = 0; i < frequency.length; i += 1) {
      if (frequency[i] === '.') continue;
      line += message.emote(`digit_${frequency[i]}${frequency[i + 1] === '.' ? 'd' : ''}`, true);
    }

    line += message.emote('letter_none', true).repeat(3);

    // PS
    for (let i = 0; i < ps.length; i += 1) {
      if (ps[i] === '¤') line += message.emote('letter_none', true);
      else {
        const number = parseInt(ps[i], 10);
        if (!Number.isNaN(number)) line += message.emote(`digit_${ps[i]}`, true);
        else line += message.emote(`letter_${ps[i].toLowerCase()}`, true);
      }
    }

    line += message.emote('letter_none', true);
    output.push(line);

    // 2- Playing Information
    let line2 = '';
    let infoLine = now[index];
    console.log(infoLine);
    infoLine = infoLine
      .padStart(infoLine.length + Math.floor((17 - infoLine.length) / 2), '¤')
      .padEnd(16, '¤');
    for (let i = 0; i < infoLine; i += 1) {
      if (infoLine[i] === '¤') line2 += message.emote('letter_none', true);
      else {
        const number = parseInt(infoLine[i], 10);
        if (!Number.isNaN(number)) line2 += message.emote(`digit_${infoLine[i]}`, true);
        else if (infoLine[i] === '-') message.emote('dsphyp');
        else line2 += message.emote(`letter_${infoLine[i].toLowerCase()}`, true);
      }
    }
    output.push(line2);

    // 3- BLANK LINE
    output.push(message.emote('letter_none', true).repeat(16));

    // 4- Volume
    let line3 = ['v', 'o', 'l', 'u', 'm', 'e', 'none'].map((c) => message.emote(`letter_${c}`, true)).join('');
    const volLevel = Math.ceil(volume / 10);
    line3 += message.emote('letter_x', true).repeat(volLevel) + message.emote('dsphyp', true).repeat(10 - volLevel);
    output.push(line3);

    // 5- Hour
    let line4 = message.emote('letter_none', true).repeat(6);
    const hr = moment().tz(message.settings.timezone).format('HH:mm');
    for (let i = 0; i < hr.length; i += 1) line4 += message.emote(hr[i] === ':' ? 'dspblk' : `digit_${hr[i]}`, true);
    line4 += message.emote('letter_none', true).repeat(6);
    output.push(line4);

    return output.join('\n');
  }
}

module.exports = NowCommand;
