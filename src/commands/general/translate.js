const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      category: 'general',
      children: [new ListSubcommand(client)],
      usage: '<target language> <text>',
      dm: true,
    });
  }

  async execute(context) {
    const targetLanguage = context.args[0];
    const text = context.args.slice(1).join(' ');
    if (!targetLanguage) return context.replyError(context.__('translate.noTargetLanguage'));
    if (!text) return context.replyError(context.__('translate.noText'));
    if (text.length > 512) return context.replyWarning(context.__('translate.textTooLong'));

    const langCode = this.client.api.getLanguage(targetLanguage);
    if (!langCode) return context.replyWarning(context.__('translate.invalidTarget', { command: `${this.client.prefix}translate list` }));
    
    const message = await context.replyLoading(context.__('global.loading'));
    this.client.api.getTranslation(text, langCode)
      .then((translation) => {
        if (typeof translation === 'number') return message.edit(`${this.client.constants.emotes.error} ${context.__('translate.error')}`);

        const embed = new RichEmbed()
          .setDescription(translation)
          .setFooter(context.__('translate.footer'), 'https://upload.wikimedia.org/wikipedia/commons/d/db/Google_Translate_Icon.png');

        message.edit(
          `${this.client.constants.emotes.translate} ${context.__('translate.title', { targetLanguage: langCode })}`,
          { embed },
        );
      })
      .catch(() => {
        message.edit(`${this.client.constants.emotes.error} ${context.__('translate.error')}`);
      });
  }
}

class ListSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list',
      aliases: ['languages'],
      category: 'general',
      dm: true,
    });
  }

  async execute(context) {
    const entries = Object.entries(this.client.constants.languages)
      .slice(1)
      .map(([code, lang]) => `${this.dot} \`${code}\`: **${lang}**`);

    this.client.menu.createMenu(
      context.message.channel.id,
      context.message.author.id,
      context.message.id,
      context.settings.misc.locale,
      context.__('translate.list', { emote: this.client.constants.emotes.translate }),
      null,
      entries,
      { footer: context.__('translate.list.footer', { command: `${this.client.prefix}translate <code> <text>` }) },
    );
  }
}

module.exports = TranslateCommand;
