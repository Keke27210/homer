const Command = require('../../structures/Command');
const expression = /title: "(.*?)",/;
const request = require('superagent');
const FormData = require('form-data');

class ShazamCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shazam',
      aliases: ['whatsong'],
      usage: '[user]',
      category: 'misc',
      private: true,
    });
  }

  async execute(context) {
    const channel = context.message.member.voiceChannel;
    if (!channel) return context.replyError(context.__('shazam.userNotInVc'));
    if (this.client.shazamWork.includes(context.message.guild.id)) return context.replyWarning(context.__('shazam.alreadyWorking'));
    if (context.message.guild.voiceConnection &&
      context.message.guild.voiceConnection.channel.id !== channel.id) return context.replyWarning(context.__('shazam.cantMove'));
    if (!channel.joinable || !channel.speakable) return context.replyError(context.__('radio.cannotJoinOrSpeak', { name: channel.name }));

    const search = context.args.join(' ');
    let user = context.message.author;
    if (search) {
      const foundMembers = this.client.finder.findMembers(context.message.guild.members, search);
      if (!foundMembers || foundMembers.length === 0) return context.replyError(context.__('finderUtil.findMembers.zeroResult', { search }));
      if (foundMembers.length === 1) {
        user = foundMembers[0].user;
      } else if (foundMembers.length > 1) return context.replyWarning(this.client.finder.formatMembers(foundMembers, context.settings.misc.locale));
    }

    await channel.join();
    this.client.shazamWork.push(context.message.guild.id);
    const m = await context.replyLoading(context.__('shazam.recording', { user: `**${user.username}**#${user.discriminator}` }));

    this.recordMusic(context.message.guild.voiceConnection, user.id)
      .then(async (data) => {
        console.log(data);
        await m.edit(`${this.client.constants.emotes.loading} ${context.__('shazam.sending')}`);
        console.log(Buffer.from(data))
        const form = new FormData();
        form.append('ajax', '1');
        form.append('song', Buffer.from(data));
        request
          .post('https://qiiqoo.abdelhafidh.com/ajax/ajax.php')
          .send(form)
          .then((response) => {
            this.client.shazamWork.splice(this.client.shazamWork.indexOf(context.message.guild.id), 1);
            const matches = (response.text || '').match(expression);
            if (!matches || matches.length === 0) return m.edit(`${this.client.constants.emotes.warning} ${context.__('shazam.unknown')}`);

            const song = expression.exec(expression);
            expression.lastIndex = 0;
            m.edit(`${this.client.constants.emotes.success} ${context.__('shazam.success', { song: song[0] })}`);
          })
          .catch((response) => {
            console.log(response)
            this.client.shazamWork.splice(this.client.shazamWork.indexOf(context.message.guild.id), 1);
            m.edit(`${this.client.constants.emotes.error} ${context.__('shazam.error', { status: response.status })}`);
          });
      })
      .catch((reason) => {
        this.client.shazamWork.splice(this.client.shazamWork.indexOf(context.message.guild.id), 1);
        if (reason === 'ERROR') {
          m.edit(`${this.client.constants.emotes.error} ${context.__('shazam.recordError')}`);
        } else {
          console.error(reason);
        }
      });
  }

  recordMusic(voiceConnection, user) {
    return new Promise((resolve, reject) => {
      console.log('HERE WE BEGIN')
      const receiver = voiceConnection.createReceiver();
      let data = '';

      const stream = receiver.createPCMStream(user);
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => {
        receiver.destroy();
        return resolve(data);
      });

      receiver.on('warn', (reason, msg) => {
        if (reason === 'decrypt') console.warn(`[SHAZAM DECRYPTION] ${msg}`);
        else console.warn(`[SHAZAM DECODING] ${msg}`);
        reject('ERROR');
      });

      this.client.setTimeout(() => stream.destroy(), 10000);
    });
  }
}

module.exports = ShazamCommand;
