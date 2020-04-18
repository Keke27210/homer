const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class NowCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'now',
      aliases: ['np', 'nowplaying'],
    });

    this.digits = {
      0: ':zero:',
      1: ':one:',
      2: ':two:',
      3: ':three:',
      4: ':four:',
      5: ':five:',
      6: ':six:',
      7: ':seven:',
      8: ':eight:',
      9: ':nine:',
      '.': ':small_blue_diamond:',
    };
  }

  async main(message) {
    const session = this.client.audioManager.sessions.find((s) => s.guild === message.guild.id);
    if (!session) {
      message.error(message._('now.noSession'));
      return 0;
    }

    const radio = await this.client.radios.getRow(session.radio);

    // Frequency
    const freq = String(radio.frequency).split('');
    let frequency = message.emote('placeholder').repeat(2);
    for (let i = 0; i < freq.length; i += 1) frequency += this.digits[freq[i]];

    const now = await this.client.radios.nowPlaying(radio.id);

    const description = [
      frequency,
      `<:RADIO:${radio.emote}> **${radio.name}**`,
      now ? message._('now.playing', now) : message._('now.noInformation'),
      message._('now.begun', message.getDuration(session.created)),
    ].join('\n');

    const embed = new MessageEmbed()
      .setDescription(description);
    message.send(message._('now.title'), embed);
    return 0;
  }
}

module.exports = NowCommand;
