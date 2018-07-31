const Command = require('../../structures/Command');

class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      category: 'owner',
      dm: true,
      hidden: true,
      private: true,
    });
  }

  get dialerReactions() {
    return [
      this.client.config.emotes.successID, //dial
      '0⃣', //zero
      '1⃣', //one
      '2⃣', //two
      '3⃣', //three
      '4⃣', //four
      this.client.config.emotes.warningID, //reset input
      '5⃣', //five
      '6⃣', //six
      '7⃣', //seven
      '8⃣', //eight
      '9⃣', //nine
      this.client.config.emotes.errorID, //cancel
    ];
  }

  async execute(context) {
    const message = await context.reply('Number to dial: **xxx-xxx**');
    for (const reaction of this.dialerReactions) await message.react(reaction);

    let number = 'xxx-xxx';
    const collector = message.createReactionCollector(
      (user, reaction) => user.id === context.message.author.id && this.dialerReactions.includes(reaction.emoji.name),
      { time: 120000 },
    );

    collector.on('collect', (reaction) => {
      const e = reaction.emoji;
      if (e.identifier === this.client.constants.emotes.successID) {
        const ctx = context;
        ctx.args = [number];

        const cmd = this.client.commands.commands.find(c => c.name === 'call');
        if (cmd) cmd.execute(ctx);

        collector.stop();
        return;
      } else if (e.identifier === this.client.constants.emotes.warningID) {
        number = 'xxx-xxx';
        message.edit('Number to dial: **' + number + '**');
        return;
      } else if (e.identifier === this.client.constants.emotes.errorID) {
        collector.stop();
        context.message.delete().catch(() => null);
        return;
      }

      const index = number.indexOf('x');
      let replace;

      if (name === '1⃣') replace = '1';
      else if (name === '2⃣') replace = '2';
      else if (name === '3⃣') replace = '3';
      else if (name === '4⃣') replace = '4';
      else if (name === '5⃣') replace = '5';
      else if (name === '6⃣') replace = '6';
      else if (name === '7⃣') replace = '7';
      else if (name === '8⃣') replace = '8';
      else if (name === '9⃣') replace = '9';
      else if (name === '0⃣') replace = '0';

      number = number.substring(0, index) + replace + number.substring(index + 1);
      message.edit('Number to dial: **' + number + '**');
    });

    collector.on('end', () => {
      message.delete();
    });
  }
}

module.exports = TestCommand;
