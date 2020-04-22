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

    // Frequency
    const freq = String(radio.frequency).split('');
    let frequency = message.emote('placeholder');
    if (freq.length < 5) frequency += message.emote('digit_n');
    for (let i = 0; i < freq.length; i += 1) {
      if (freq[i] === '.') continue;
      frequency += message.emote(`digit_${freq[i]}${freq[i + 1] === '.' ? 'd' : ''}`);
    }

    const now = await this.client.radios.nowPlaying(radio.id);

    const description = [
      `${frequency}`,
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
}

module.exports = NowCommand;
