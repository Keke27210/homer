const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class NowCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'now',
      aliases: ['np', 'nowplaying'],
    });
  }

  /**
   * Generates a well-designed volume bar
   * @param {number} volume Volume (0-100)
   * @static
   * @returns {string}
   */
  static getVolume(volume) {
    const str = '──────────';
    const index = Math.round(volume / 10);
    return `${str.substring(0, index - 1)}○${str.substring(index)}`;
  }

  async main(message) {
    const player = this.client.lavacordManager.players.get(message.guild.id);
    if (!player) {
      message.error(message._('now.noSession'));
      return 0;
    }

    const radio = await this.client.radios.getRow(player.radio);

    const display = this.constructor.getDisplay(message, radio.frequency, radio.ps);

    const now = await this.client.radios.nowPlaying(radio.id);

    const description = [
      display,
      `🔈 ${this.constructor.getVolume(message.settings.volume)}\n`,
      `<:RADIO:${radio.emote}> **${radio.name}**`,
      `${message.dot} ${message._('now.playing')}: ${now ? `**${now}**` : message._('now.noInformation')}`,
      `${message.dot} ${message._('now.begun')}: **${message.getDuration(player.start)}**`,
    ].join('\n');

    const embed = new MessageEmbed()
      .setDescription(description);
    message.send(message._('now.title'), embed);
    return 0;
  }

  /**
   * Returns a neat display for radio information
   * @param {Message} message Message to get emotes from
   * @param {string} frequency Radio frequency
   * @param {string} ps Program Service
   * @returns {string}
   */
  static getDisplay(message, frequency, ps) {
    let output = '';

    // Frequency
    if (frequency.length < 5) output += message.emote('letter_none');
    for (let i = 0; i < frequency.length; i += 1) {
      if (frequency[i] === '.') continue;
      output += message.emote(`digit_${frequency[i]}${frequency[i + 1] === '.' ? 'd' : ''}`);
    }

    output += message.emote('placeholder').repeat(2);

    // PS
    for (let i = 0; i < ps.length; i += 1) {
      if (ps[i] === '¤') output += message.emote('letter_none');
      else {
        const number = parseInt(ps[i], 10);
        if (!Number.isNaN(number)) output += message.emote(`digit_${ps[i]}`);
        else output += message.emote(`letter_${ps[i].toLowerCase()}`);
      }
    }

    return output;
  }
}

module.exports = NowCommand;
