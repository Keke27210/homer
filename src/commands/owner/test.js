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
      this.client.constants.emotes.successID, //dial
      '0%E2%83%A3', //zero
      '1%E2%83%A3', //one
      '2%E2%83%A3', //two
      '3%E2%83%A3', //three
      '4%E2%83%A3', //four
      this.client.constants.emotes.warningID, //reset input
      '5%E2%83%A3', //five
      '6%E2%83%A3', //six
      '7%E2%83%A3', //seven
      '8%E2%83%A3', //eight
      '9%E2%83%A3', //nine
      this.client.constants.emotes.errorID, //cancel
      '🛂', //support
    ];
  }

  async execute(context) {
    const message = await context.reply('Number to dial: **xxx-xxx**');
    for (const reaction of this.dialerReactions) await message.react(reaction);

    let number = 'xxx-xxx';
    const collector = message.createReactionCollector(
      (reaction, user) => user.id === context.message.author.id && this.dialerReactions.includes(reaction.emoji.identifier),
      { time: 120000 },
    );

    collector.on('collect', (reaction) => {
      const e = reaction.emoji;
      reaction.delete().catch(() => null);

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
      } else if (e.name === '🛂') {
        number = 'SUPPORT';
        message.edit('Number to dial: **' + number + '**')
      }

      const index = number.indexOf('x');
      if (index === -1) return;
      let replace;

      if (e.name === '1⃣') replace = '1';
      else if (e.name === '2⃣') replace = '2';
      else if (e.name === '3⃣') replace = '3';
      else if (e.name === '4⃣') replace = '4';
      else if (e.name === '5⃣') replace = '5';
      else if (e.name === '6⃣') replace = '6';
      else if (e.name === '7⃣') replace = '7';
      else if (e.name === '8⃣') replace = '8';
      else if (e.name === '9⃣') replace = '9';
      else if (e.name === '0⃣') replace = '0';

      number = number.substring(0, index) + replace + number.substring(index + 1);
      message.edit('Number to dial: **' + number + '**');
    });

    collector.on('end', () => {
      message.delete();
    });
  }
}

module.exports = TestCommand;
