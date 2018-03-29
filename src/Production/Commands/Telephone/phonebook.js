const Command = require('../../../Core/Structures/Command');

class Phonebook extends Command {
  constructor(client) {
    super(client, {
      name: 'phonebook',
      aliases: ['numbers'],
      category: 5,
    });
  }

  async run(ctx) {
    if (ctx.args[0] === 'switch') {
      if (!ctx.member.permissions.has('MANAGE_GUILD')) return ctx.channel.send(ctx.__('command.missingPerm.user', {
        errorIcon: this.client.constants.statusEmotes.error,
        missingPermissions: ['MANAGE_GUILD'].map(perm => `\`${perm}\``).join(', '),
      }));

      if (ctx.settings.data.phone.phonebook) {
        ctx.settings.data.phone.phonebook = false;
        await ctx.settings.saveData();
        ctx.channel.send(ctx.__('phonebook.switch.disabled'));
      } else {
        ctx.settings.data.phone.phonebook = true;
        await ctx.settings.saveData();
        ctx.channel.send(ctx.__('phonebook.switch.enabled'));
      }
    } else {
      const search = ctx.args.join(' ');
      if (!search) return ctx.channel.send(ctx.__('phonebook.error.noSearch', {
        errorIcon: this.client.constants.statusEmotes.error,
      }));

      const numbers = await this.client.database.getDocuments('guild')
        .then(settings => settings
          .filter(s => s.phone.number && s.phone.phonebook &&
            (s.phone.number.includes(search) ||
            this.client.guilds.get(s.id).name.toLowerCase().includes(search.toLowerCase())))
          .map(s => ({ id: s.id, number: s.phone.number })));

      if (numbers.length === 0) return ctx.channel.send(ctx.__('phonebook.error.noFound', {
        errorIcon: this.client.constants.statusEmotes.error,
        search,
      }));

      const numbersArray = [];
      for (const number of numbers) {
        const guild = this.client.guilds.get(number.id);
        const guildLocale = await this.client.database.getDocument('guild', guild.id).then(g => g.misc.locale);
        ctx.setLocale(guildLocale);
        numbersArray.push(`- **${guild.name}**: ${number.number} [${ctx.__('lang.flagEmote')}]`);
      }

      ctx.setLocale(ctx.settings.data.misc.locale);
      ctx.channel.send(ctx.__('phonebook.list', {
        search,
        list: numbersArray.join('\n'),
      }));
    }
  }
}

module.exports = Phonebook;
