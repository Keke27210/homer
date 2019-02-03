const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

class RemindCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remind',
      aliases: ['reminder', 'remindme'],
      category: 'misc',
      usage: '<duration> <text>',
      children: [new ListSubcommand(client), new DeleteSubcommand(client)],
      dm: true,
    });
  }

  async execute(context) {
    const process = Array.from(context.args);
    let time = 0;
    let text = '';

    for (let i = 0; i < process.length; i += 1) {
      const duration = this.client.time.parseDuration(process[i], context.settings.misc.locale);
      if (duration > 0) time += duration;
      else text += ` ${process[i]}`;
    }

    if (time === 0) return context.replyError(context.__('remind.noDuration'));
    if (time < 60000) time = 60000;
    if (text.length === 0) return context.replyError(context.__('remind.noText'));
    if (text.length > 128) return context.replyWarning(context.__('remind.textTooLong'));

    const start = (Date.now() + 1000);
    const end = (start + time);
    await this.client.database.insertDocument(
      'jobs',
      {
        start,
        duration: time,
        end,
        user: context.message.author.id,
        type: 'remind',
        text: text.trim(),
        time: Date.now(),
      },
    );

    context.reply(context.__('remind.set', {
      expire: this.client.time.timeSince(end, context.settings.misc.locale),
    }));
  }
}

class ListSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list',
      category: 'misc',
      dm: true,
    });
  }

  async execute(context) {
    const jobs = await this.client.database.findDocuments('jobs', { type: 'remind', user: context.message.author.id });
    if (jobs.length === 0) return context.replyWarning(context.__('remind.list.noActiveRemind'));

    const listInformation = jobs
      .sort((a, b) => a.time - b.time)
      .map((job, index) => {
        const timeExpire = this.client.time.timeSince(job.end, context.settings.misc.locale, true);
        return `${this.dot} \`${index + 1}\`: ${job.text} • ${context.__('remind.list.expireIn', { time: timeExpire })}`;
      })
      .join('\n');

    const embed = new RichEmbed()
      .setDescription(listInformation);

    context.reply(
      context.__('remind.list.title', { name: `**${context.message.author.username}**#${context.message.author.discriminator}` }),
      { embed },
    );
  }
}

class DeleteSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete',
      aliases: ['remove'],
      category: 'misc',
      usage: '<ID>',
      dm: true,
    });
  }

  async execute(context) {
    const id = context.args[0];
    if (!id) return context.replyError(context.__('remind.delete.noID'));

    const job = await this.client.database.findDocuments('jobs', { type: 'remind', user: context.message.author.id })
      .then(jobs => jobs.sort((a, b) => a.time - b.time)[id - 1]);
    if (!job) return context.replyWarning(context.__('remind.delete.notFound', { id }));

    const m = await context.replyWarning(context.__('remind.delete.prompt', { text: job.text }));
    (async () => {
      await m.react(this.client.constants.emotes.successID);
      await m.react(this.client.constants.emotes.errorID);
    })();

    m.awaitReactions(
      (reaction, user) => [this.client.constants.emotes.successID, this.client.constants.emotes.errorID].includes(reaction.emoji.identifier) && user.id === context.message.author.id,
      { max: 1 },
    )
      .then((reactions) => {
        const identifier = reactions.first().emoji.identifier;
        if (identifier === this.client.constants.emotes.successID) {
          await this.client.database.deleteDocument('jobs', job.id);
          message.edit(`${this.client.constants.emotes.success} ${context.__('remind.delete.removed', { id })}`);
        } else {
          message.edit(`${this.client.constants.emotes.error} ${context.__('remind.delete.cancel')}`);
        }
      });
  }
}

module.exports = RemindCommand;
