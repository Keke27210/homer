const { MessageEmbed } = require('discord.js');

const Command = require('../../structures/Command');

class LanguageCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'language',
      aliases: ['lang', 'locale'],
      userPermissions: ['MANAGE_GUILD'],
      dm: true,
    });
  }

  async main(message, args) {
    const [locale] = args;
    if (!locale) {
      const description = Object.entries(this.client.localeManager.locales)
        .map(([code, lang]) => `${message.dot} \`${code}\`: **${lang._.name}** - ${message._('language.revision')}: **${message.getDuration(lang._.revision)}**`)
        .join('\n');
      const embed = new MessageEmbed()
        .setDescription(description)
        .setFooter(message._('language.footer'));
      message.send(message._('language.title'), embed);
      return 0;
    }

    if (!this.client.localeManager.isValid(locale)) {
      message.warn(message._('language.unknown', locale));
      return 0;
    }

    const ret = await this.client.settings.setLocale(message.settings.id, locale)
      .then(() => {
        message.success(message._('language.set'));
        return 0;
      })
      .catch((error) => {
        this.client.logger.error(`[command->language] Error while setting locale ${locale} for settings ID ${message.settings.id}`, error);
        message.error(message._('language.error'));
        return 1;
      });

    return ret;
  }
}

module.exports = LanguageCommand;
