const Command = require('../../structures/Command');
const TTS = require('google-tts-api');

class TtsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tts',
      usage: '<lang> <text>',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const lang = context.args[0];
    if (!lang) return context.replyError(context.__('tts.noLang'));

    const text = context.args.slice(1).join(' ');
    if (!text) return context.replyError(context.__('tts.noText'));
    if (text.length > 200) return context.replyWarning(context.__('tts.textLength'));

    const langCode = this.client.api.getLanguage(lang);
    if (!langCode) return context.replyWarning(context.__('tts.invalidLang', { command: `${this.client.prefix}translate list` }));

    const link = await TTS(text, langCode);
    context.reply({ embed: { description: context.__('tts.result', { link }) } });
  }
}

module.exports = TtsCommand;
