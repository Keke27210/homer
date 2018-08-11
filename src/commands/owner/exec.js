const snekfetch = require('snekfetch');
const { exec } = require('child_process');
const Command = require('../../structures/Command');
const { Attachment } = require('discord.js');

class ExecCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'exec',
      aliases: ['bash'],
      category: 'owner',
      private: true,
      dm: true,
    });
  }

  async execute(context) {
    const code = context.args.join(' ');
    if (!code) return context.replyError('You must provide a code to execute.');

    exec(code, async (error, stdout, stderr) => {
      if (error) return context.replyError(`An error occured during execution!\n\`\`\`js\n${error}\`\`\``);

      let message = '';
      if (stderr) message += stderr;
      if (stdout) message += stdout;

      if (message.length <= 1950) {
        context.reply(message, { code: true });
      } else {
        const data = await snekfetch
          .post('https://hastebin.com/documents')
          .set('Content-Type', 'application/json')
          .send(message)
          .then(res => res.body)
          .catch(() => null);

        if (data) {
          context.replyWarning(`Output too long! Uploaded on Hastebin: <https://hastebin.com/${data.key}>`);
        } else {
          context.replyWarning('Output too long! Upload log file.', {
            files: [new Attachment(Buffer.from(message), 'output.txt')],
          });
        }
      }
    });
  }
}

module.exports = ExecCommand;
