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
     * Time between each refresh (5s)
     * @type {number}
     */
    this.refreshTime = 5 * 1000;

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
      '🔉': (message, player) => {
        let volume = Math.floor(message.settings.volume / 10);
        if (volume < 1) volume = 0;
        else volume -= 1;
        player.volume(volume * 10);
        this.client.settings.setVolume(message.guild.id, volume * 10);
        return true;
      },
      '◀️': async (message, player) => {
        const freq = (player.frequency - 0.1).toFixed(1);
        // eslint-disable-next-line no-nested-ternary
        player.setFrequency(freq < 87.5 ? 108 : (freq > 108 ? 87.5 : freq));
        const radio = await this.client.radios.getRadio(freq);
        const track = await this.client.lavacordManager.getTracks(radio
          ? radio.stream
          : this.noProgramme);
        if (track.track !== player.track) await player.play(track.track);
        return true;
      },
      '⏹️': (message, player) => {
        player.stop();
        player.destroy();
        this.client.lavacordManager.leave(message.guild.id);
        return false;
      },
      '▶️': async (message, player) => {
        const freq = (player.frequency + 0.1).toFixed(1);
        // eslint-disable-next-line no-nested-ternary
        player.setFrequency(freq < 87.5 ? 108 : (freq > 108 ? 87.5 : freq));
        const radio = await this.client.radios.getRadio(freq);
        const track = await this.client.lavacordManager.getTracks(radio
          ? radio.stream
          : this.noProgramme);
        if (track.track !== player.track) await player.play(track.track);
        return true;
      },
      '🔊': (message, player) => {
        let volume = Math.floor(message.settings.volume / 10);
        if (volume > 9) volume = 10;
        else volume += 1;
        player.volume(volume * 10);
        this.client.settings.setVolume(message.guild.id, volume * 10);
        return true;
      },
    };
  }

  async main(message, [frequency]) {
    frequency = Number(frequency).toFixed(1);
    if (Number.isNaN(frequency) || (frequency < 87.5 && frequency > 108)) frequency = 87.5;

    const channel = message.guild.channels.resolve(message.settings.radio);
    if (!channel) return message.warn(message._('radio.unset'));

    const { voice } = message.member;
    if (!voice || voice.channelID !== channel.id) return message.error(message._('radio.channel', channel.name));

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

    player.setFrequency(frequency);

    let radio = await this.client.radios.getRadio(String(player.frequency));
    if (!radio) radio = ({ stream: this.noProgramme });

    const track = await this.client.lavacordManager.getTracks(radio.stream).then((r) => r[0]);
    await player.play(track.track, { volume: message.settings.volume });

    const embed = await this.generateEmbed(message);
    const m = await message.send(embed);
    const interval = this.client.setInterval(
      () => m.edit(this.generateEmbed(message).catch(() => this.client.clearInterval(interval))),
      this.refreshTime,
    );

    const emotes = Object.keys(this.actions);
    (async function react() {
      for (let i = 0; i < emotes.length; i += 1) await m.react(emotes[i]);
    }());

    const collector = m.createReactionCollector(
      (reaction, user) => emotes.includes(reaction.emoji.name) && user.id === message.author.id,
    );

    collector.on('collect', async (reaction) => {
      if (await this.actions[reaction.emoji.name](message, player)) {
        m.edit(this.generateEmbed(message));
      }
    });
    player.once('end', () => {
      if (message.deletable) message.delete();
      this.client.clearInterval(interval);
      m.delete();
    });

    return 0;
  }

  async generateEmbed(message) {
    const player = this.client.lavacordManager.players.get(message.guild.id);
    const embed = new MessageEmbed();
    const lines = [];

    // 1- Frequency and PS
    const radio = await this.client.radios.getRadio(String(player.frequency));
    lines.push(this.generateLine(message, ` ${player.frequency < 100 ? ' ' : ''}${String(player.frequency)}   ${radio ? radio.ps : 'NOSIGNAL'}`));

    // 2- Playing information
    if (!player.playing || (player.refreshes % player.playing.length) === 0) {
      player.setPlaying(await this.client.radios.nowPlaying(radio.id));
    }
    lines.push(this.generateLine(message, player.playing, true));

    // 3- Blank line
    lines.push(this.generateLine(message, ''));

    // 4- Volume
    const level = Array(10).fill('-');
    for (let i = 0; i < (Math.ceil(message.settings.volume / 10)); i += 1) level[i] = 'X';
    lines.push(this.generateLine(message, `VOLUME ${level.join('')}`, true));

    // 5- Hour
    const hour = moment()
      .tz(message.settings.timezone)
      .format('HH:mm');
    lines.push(this.generateLine(message, hour, true));

    embed.setDescription(lines.join('\n'));
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

    if (typeof str !== 'string') str = '';
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
