/* eslint-disable no-param-reassign */
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

const Command = require('../../structures/Command');

class UiCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'ui',
      private: true,
    });

    /**
     * Length of a line
     * @type {number}
     */
    this.lineLength = 17;

    /**
     * No programme's FX
     * @type {string}
     */
    this.noProgramme = 'https://raw.githubusercontent.com/Keke27210/homer_cdn/master/assets/radios/NO_PROGRAMME.mp3';

    /**
     * Radio interface emotes and actions
     * @type {object}
     */
    this.actions = {
      '🔉': () => '',
    };
  }

  async main(message, [frequency]) {
    frequency = Number(frequency).toFixed(1);
    if (Number.isNaN(frequency)) frequency = null;

    const channel = message.guild.channels.resolve(message.settings.radio);
    if (!channel) return message.warn(message._('radio.unset'));

    const { voice } = message.member;
    if (!voice || voice.channelID !== channel.id) return message.error(message._('radio.channel', channel.name));

    const embed = await this.generateEmbed(message);
    const m = await message.send(embed);

    const emotes = Object.keys(this.actions);
    (async function react() {
      for (let i = 0; i < emotes.length; i += 1) await m.react(emotes[i]);
    }());

    const existing = this.client.lavacordManager.players.get(message.guild.id);
    if (existing) {
      await existing.destroy();
      this.client.lavacordManager.players.delete(message.guild.id);
    }

    const player = await this.client.lavacordManager.join({
      channel: channel.id,
      guild: message.guild.id,
      node: this.client.lavacordManager.idealNodes[0].id,
    });

    player.frequency = frequency || '87.5';

    const radio = await this.client.radios.getRadio(player.frequency)
      || ({ stream: this.noProgramme });

    const track = await this.client.lavacordManager.getTracks(radio.stream).then((r) => r[0]);
    await player.play(track);

    const collector = m.createReactionCollector(
      (reaction, user) => emotes.includes(reaction.emoji.name) && user.id === message.author.id,
    );

    collector.on('collect', (reaction) => this.actions[reaction.emoji.name](message, player));
    player.once('end', m.delete());

    return 0;
  }

  async generateEmbed(message) {
    const player = this.client.lavacordManager.players.get(message.guild.id);
    const embed = new MessageEmbed();
    const lines = [];

    // 1- Frequency and PS
    const radio = await this.client.radios.getRadio(player.frequency);
    lines.push(this.generateLine(message, `  ${player.frequency}   ${radio ? radio.ps : 'NOSIGNAL'}`));

    // 2- Playing information
    let { playing } = player;
    if (!playing || (player.refreshes % playing.length) === 0) {
      playing = await this.client.radios.nowPlaying(radio.id);
      player.playing = playing;
      this.client.lavacordManager.players.set(message.guild.id, player);
    }
    //lines.push(this.generateLine(message, playing || '', true));

    // 3- Blank line
    lines.push(this.generateLine(message, ''));

    // 4- Volume
    const level = Array(10).fill(message.emote('char_-', true));
    for (let i = 0; i < (Math.ceil(message.settings.volume / 10)); i += 1) level[i] = message.emote('letter_x', true);
    lines.push(this.generateLine(message, `VOLUME ${level.join('')}`, true));

    // 5- Hour
    const hour = moment()
      .tz(message.settings.timezone)
      .format('HH:mm');
    lines.push(this.generateLine(message, hour, true));

    embed.setDescription(lines.push('\n'));
    embed.setFooter(message._('radio.footer'));

    return embed;
  }

  /**
   * Generates a 17-char long radio-stylized message
   * @param {Message} message Message that instantied this radio
   * @param {?string} str Message to display
   * @param {?boolean} center Whether center string
   * @returns {string}
   */
  generateLine(message, str = '', center = false) {
    const line = Array(this.lineLength).fill(message.emote('off', true));
    let i = 0;
    let j = 0;
    console.log(message);
    console.log(str)
    if (center) {
      str = str
        .trim()
        .padStart(str.length + Math.floor((this.lineLength - str.length) / 2), ' ')
        .padEnd(this.lineLength, ' ');
    }

    while (i < str.length) {
      const c = str[i];
      if (!c || c === '.') {
        i += 1;
        continue;
      }

      if (c === ' ') {
        i += 1;
        j += 1;
        continue;
      }

      const dot = Number.isNaN(Number(c)) ? false : (str[i + 1] === '.');
      const e = ['char', 'digit', 'letter'].map((t) => message.emote(`${t}_${c.normalize('NFD')[0].toLowerCase()}${dot ? 'd' : ''}`, true));
      line[j] = e[0] || e[1] || e[2] || message.emote('off', true);

      i += 1;
      j += 1;
    }

    return line.join('');
  }
}

module.exports = UiCommand;
