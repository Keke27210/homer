const Command = require('../../structures/Command');

class RadiosCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'radios',
      dm: true,
    });
  }

  async main(message) {
    const radios = await this.client.radios.getRows();
    if (!radios.length) {
      message.info(message._('radios.empty'));
      return 0;
    }

    const entries = radios
      .sort((a, b) => parseFloat(a.frequency) - parseFloat(b.frequency))
      .map((r) => `\`${(r.frequency / 10).toFixed(1)}\`: ${r.emote ? `<:RADIO:${r.emote}>` : message.dot} [${r.name}](${r.website}) - ${r.language} (${r.country}) - ${message._(`radios.pty.${r.pty}`)}`);

    const count = Math.ceil(entries.length / 10);
    const pages = [];
    for (let i = 0; i < count; i += 1) {
      pages.push({ title: ' ', footer: message._('radios.footer', i + 1, count) });
    }

    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('radios.list'),
      pages,
      entries,
    );

    return 0;
  }
}

module.exports = RadiosCommand;
