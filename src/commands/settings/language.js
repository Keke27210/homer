const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class LanguageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'language',
      aliases: ['locale', 'lang'],
      usage: '<language code>',
      category: 'settings',
      children: [new ListSubcommand(client)],
      dm: true,
      userPermissions: ['MANAGE_GUILD'],
    });
  }

  async execute(context) {
    const language = context.args[0];
    if (!language) return context.replyError(context.__('language.noLanguage', { command: `${this.client.prefix}language list` }));

    if (!this.client.localization.isLocale(language)) {
      return context.replyWarning(context.__('language.invalidLanguage', { command: `${this.client.prefix}language list` }));
    }

    context.settings.misc.locale = language;
    await context.saveSettings();
    context.reply(context.__('language.setLanguage', {
      flag: context.__('lang.flag'),
      name: context.__('lang.name'),
    }));
  }
}

class ListSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list',
      category: 'settings',
      dm: true,
    });
  }

  async execute(context) {
    const languageInformation = [];
    for (const language of Object.keys(this.client.localization.locales)) {
      const locale = this.client.localization.locales[language];
      const authors = [];
      for (const author of locale['lang.authors']) {
        const user = await this.client.fetchUser(author);
        authors.push(`**${user.username}**#${user.discriminator}`);
      }

      languageInformation.push(`${locale['lang.flag']} **${locale['lang.name']}** (\`${locale['lang.code']}\`) - ${context.__('language.list.authors', { authors: authors.join(', ') })}`);
    }

    const embed = new RichEmbed()
      .setDescription(languageInformation.join('\n'))
      .setFooter(context.__('language.list.footer', { command: `${this.client.prefix}language <language code>` }));

    context.reply(
      context.__('language.list.title', { name: this.client.user.username }),
      { embed },
    );
  }
}

module.exports = LanguageCommand;
