/* eslint-disable no-param-reassign */
const { Player } = require('lavacord');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

const emotes = {
  '🔉': (player) => player.setVolume(player.state.volume - 10),
  '◀️': (player) => player.setFrequency(player.frequency - 1),
  '⏹️': (player) => player.destroyRadio(),
  '▶️': (player) => player.setFrequency(player.frequency + 1),
  '🔊': (player) => player.setVolume(player.state.volume + 10),
};

class CustomPlayer extends Player {
  constructor(node, id) {
    super(node, id);

    this.client = null;
    this.message = null;
    this.frequency = null;
    this.playingInfo = [];
    this.radioMessage = null;
    this.refreshes = 0;
    this.lineLength = 17;
    this.noProgramme = 'https://raw.githubusercontent.com/Keke27210/homer_cdn/master/assets/radios/NO_PROGRAMME.mp3';
  }

  async setup(message, frequency) {
    this.client = message.client;
    this.message = message;
    await this.setFrequency(frequency);

    const embed = await this.generateEmbed();
    const m = await message.send(embed);
    this.radioMessage = m;

    const e = Object.keys(emotes);
    (async function react() {
      for (let i = 0; i < e.length; i += 1) await m.react(e[i]);
    }());

    const collector = m.createReactionCollector(
      (reaction, user) => e.includes(reaction.emoji.name) && user.id === message.author.id,
    );

    collector.on('collect', async (reaction) => {
      emotes[reaction.emoji.name](this);
      reaction.users.remove(message.author.id)
        .catch(() => null);
      m.edit(await this.generateEmbed());
    });

    const interval = this.client.setInterval(async () => {
      m.edit(await this.generateEmbed())
        .catch(() => this.client.clearInterval(interval));
    }, (5 * 1000));
  }

  async setFrequency(frequency) {
    if (typeof frequency === 'string') frequency = Number(frequency) * 10;

    const radio = await this.client.radios.getRadio(String(frequency / 10));
    const track = await this.client.lavacordManager.getTracks(radio
      ? radio.stream
      : this.noProgramme).then((r) => r[0]);

    if (track.track !== this.track) {
      await this.play(track.track, {
        noReplace: false,
        volume: this.state.volume,
      });
    }

    this.frequency = frequency;
    this.playingInfo = [];
    if (radio && radio.radionet) await this.setPlaying(radio.id);
    this.refreshes = 0;
  }

  async setPlaying(id) {
    const info = await this.client.radios.nowPlaying(id)
      .catch(() => null);
    if (info) {
      const a = info.split('-');
      for (let i = 0; i < a.length; i += 1) {
        if (a[i].length > 17) a[i] = a[i].match(/(.{1,17})(?:\s|$)/g);
      }
      this.playingInfo = a.flat();
    } else {
      this.playingInfo = [];
    }
  }

  setVolume(volume) {
    if (volume < 0) volume = 0;
    else if (volume > 100) volume = 100;
    this.volume(volume);
    this.client.settings.setVolume(volume);
  }

  async generateEmbed() {
    const embed = new MessageEmbed();
    const lines = [];

    // 1- Frequency and PS
    const radio = await this.client.radios.getRadio(String((this.frequency / 10).toFixed(1)));
    lines.push(this.generateLine(` ${this.frequency < 1000 ? ' ' : ''}${radio.frequency}   ${radio ? radio.ps : 'NOSIGNAL'}`));

    // 2- Playing information
    if (radio && (this.refreshes % this.playingInfo.length) === 0) {
      await this.setPlaying(radio.id);
    }
    lines.push(this.generateLine(this.playingInfo[this.refreshes % this.playingInfo.length], true));

    // 3- Blank line
    lines.push(this.generateLine(''));

    // 4- Volume
    const level = Array(10).fill('-');
    for (let i = 0; i < (Math.ceil(this.state.volume / 10)); i += 1) level[i] = 'X';
    lines.push(this.generateLine(`VOLUME ${level.join('')}`, true));

    // 5- Hour
    const hour = moment()
      .tz(this.message.settings.timezone)
      .format('HH:mm');
    lines.push(this.generateLine(hour, true));

    embed.setDescription(lines.join('\n'));
    embed.setFooter(this.message._('radio.footer'));

    this.refreshes += 1;
    return embed;
  }

  /**
   * Generates a 17-char long radio-stylized message
   * @param {?string} str Message to display
   * @param {?boolean} center Whether center string
   * @returns {string}
   */
  generateLine(str = '', center = false) {
    const line = Array(this.lineLength).fill(this.message.emote('off', true));
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
      const e = ['char', 'digit', 'letter'].map((t) => this.message.emote(`${t}_${c.normalize('NFD')[0].toLowerCase()}${dot ? 'd' : ''}`, true));
      line[j] = e[0] || e[1] || e[2] || this.message.emote('off', true);

      i += 1;
      j += 1;
    }

    return line.join('');
  }

  destroyRadio() {
    this.radioMessage.delete();
    if (this.message.deletable) this.message.delete();
    this.stop().then(() => this.destroy());
    this.client.lavacordManager.leave(this.message.guild.id);
  }
}

module.exports = CustomPlayer;
