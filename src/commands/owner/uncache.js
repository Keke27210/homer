const Command = require('../../structures/Command');

class UncacheCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'uncache',
      category: 'owner',
      dm: true,
      private: true,
    });
  }

  async execute(context) {
    const [table, key] = context.args;
    if (!table) return context.replyError(`Correct syntax: \`${this.client.prefix}uncache <table/all> [key]\``);

    if (table === 'all') {
      for (const key of Object.keys(this.client.database.cache)) this.client.database.cache[key] = [];
      context.replySuccess('Successfully cleaned all caches!');
    } else {
      if (!this.client.database.cache[table]) return context.replyWarning(`No table found matching \`${table}\`!`);
      if (key) {
        const item = this.client.database.cache[table].find(item => item ? item.id === key : false);
        if (!item) return context.replyWarning(`No document found in table \`${table}\` with ID \`${key}\`!`);

        this.client.database.cache[table].splice(this.client.database.cache[table].indexOf(item), 1);
        context.replySuccess(`Successfully cleaned cache for \`${table}\`/\`${key}\`!`);
      } else {
        this.client.database.cache[table] = [];
        context.replySuccess(`Successfully cleaned cache for table \`${table}\`!`);
      }
    }
  }
}

module.exports = UncacheCommand;
