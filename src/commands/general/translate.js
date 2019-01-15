const translator = require('google-translate-api');
const { RichEmbed } = require('discord.js');
const Command = require('../../structures/Command');

class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      category: 'general',
      usage: '<target language> <text>',
      dm: true,
    });
  }

  async execute(context) {
    const targetLanguage = context.args[0];
    const text = context.args.slice(1).join(' ');
    if (!targetLanguage) return context.replyError(context.__('translate.noTargetLanguage'));
    if (!Object.keys(translator.languages).includes(targetLanguage)) return context.replyWarning(context.__('translate.invalidTarget'));
    if (!text) return context.replyError(context.__('translate.noText'));
    if (text.length > 512) return context.replyWarning(context.__('translate.textTooLong'));

    const message = await context.replyLoading(context.__('global.loading'));
    translator(text, { to: targetLanguage })
      .then((response) => {
        const embed = new RichEmbed()
          .setDescription(response.text)
          .setFooter(context.__('translate.footer'), 'https://upload.wikimedia.org/wikipedia/commons/d/db/Google_Translate_Icon.png');

        message.edit(
          `${this.client.constants.emotes.translate} ${context.__('translate.title', { targetLanguage })}`,
          { embed },
        );
      })
      .catch(() => {
        message.edit(`${this.client.constants.emotes.error} ${context.__('translate.error')}`);
      });
  }
}

module.exports = TranslateCommand;
