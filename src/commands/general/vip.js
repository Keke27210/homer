const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class VipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'vip',
      children: [new AddSubcommand(client), new RemoveSubcommand(client)],
      category: 'general',
      dm: true,
    });
  }

  async execute(context) {
    const list = await this.client.database.getDocuments('vip', true);

    const users = [];
    for (let i = 0; i < list.length; i += 1) {
      const user = await this.client.fetchUser(list[i].id);
      if (!user) continue;
      users.push(`${this.dot} **${user.username}**#${user.discriminator}: ${list[i].message}`);
    }

    if (users.length === 0) return context.replyWarning(context.__('vip.noPeople'));

    const embed = new RichEmbed()
      .setDescription(context.__('vip.embed.description'))
      .addField(context.__('vip.embed.list'), users.join('\n'));

    context.reply(context.__('vip.title', { name: this.client.user.username }), { embed });
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      category: 'general',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const id = context.args[0];
    const message = context.args.slice(1).join(' ');
    if (!id || !message) return context.replyError('You must provide a user ID and a message to add!');
    if (message.length > 64) return context.replyWarning('The message length must not exceed 64 characters.');

    const user = await this.client.fetchUser(id)
      .catch(() => null);
    if (!user) return context.replyWarning(`No user found matching ID \`${id}\`.`);

    await this.client.database.insertDocument(
      'vip',
      {
        id: user.id,
        message,
      },
      {
        conflict: 'update',
      },
    );

    context.replySuccess(`Successfully added or edited **${user.username}**#${user.discriminator} as VIP!`);
  }
}

class RemoveSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      category: 'general',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const id = context.args[0];
    if (!id) return context.replyError('You must provide a user ID to remove!');

    const user = await this.client.fetchUser(id)
      .catch(() => null);
    if (!user) return context.replyWarning(`No user found matching ID \`${id}\`.`);

    const exist = await this.client.database.getDocument('vip', user.id);
    if (!exist) return context.replyError(`**${user.username}**#${user.discriminator} is not a VIP!`);

    await this.client.database.deleteDocument('vip', user.id);

    context.replySuccess(`Successfully removed **${user.username}**#${user.discriminator} as VIP!`);
  }
}

module.exports = VipCommand;
