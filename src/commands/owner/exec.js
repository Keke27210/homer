/* eslint-disable class-methods-use-this */
const { exec } = require('child_process');
const fetch = require('node-fetch');

const Command = require('../../structures/Command');

class ExecCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'exec',
      aliases: ['bash', 'sh'],
      dm: true,
      private: true,
    });
  }

  async main(message, args) {
    const code = args.join(' ');

    const m = await message.loading('Executing code...');
    exec(code, async (err, stdout, stderr) => {
      if (err) {
        m.editError(`Failed to execute command \`${code}\`.\n\`\`\`xl\n${err}\`\`\``);
        return 0;
      }

      let output = '';
      if (stderr) output += stderr;
      if (stdout) output += stdout;

      if (output.length < (2000 - 16)) m.edit(output, { code: 'xl' });
      else {
        const res = await fetch('https://hastebin.com/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: output,
        })
          .then((r) => r.json())
          .catch(() => null);
        if (res && res.key) m.editWarn(`Output uploaded to Hastebin: <https://hastebin.com/${res.key}>`);
        else {
          m.editWarn('Output could not be uploaded to Hastebin...');
          message.send({ files: [{ name: 'output.txt', attachment: Buffer.from(output) }] });
        }
      }

      return 0;
    });
  }
}

module.exports = ExecCommand;
