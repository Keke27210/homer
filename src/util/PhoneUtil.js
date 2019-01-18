const Util = require('./Util');

class PhoneUtil extends Util {
  constructor(client) {
    super(client);
  }

  async getStatus(id) {
    const calls = await this.client.database.getDocuments('calls', true);
    if (calls.length === 0) return 0;

    return calls.find((call) => {
      if (call.type === 0) return call.sender.id === id || call.receiver.id === id;
      else call.receivers.find(r => r.id === id);
    }) ? 1 : 0;
  }

  async handleMessage(message) {
    if (message.author.bot) return;

    const blacklist = await this.client.database.getDocument('blacklist', message.author.id);
    if (blacklist) return;

    const calls = await this.client.database.getDocuments('calls', true);
    const call = calls.find(c => c.type === 0 ? [c.sender.id, c.receiver.id].includes(message.channel.id) : c.receivers.find(r => r.id === message.channel.id));
    if (!call) return;

    if (call.type === 0) {
      const destination = call.sender.id === message.channel.id ? 'receiver' : 'sender';
      const destSettings = await this.client.database.getDocument('settings', call[destination].settings);
      if (destSettings.ignored.includes(message.author.id)) return;

      // Removing link auto-embed
      let content = message.cleanContent;
      const linkTest = content.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm);
      for (const link of linkTest || []) content = content.replace(link, `<${link}>`);

      const msg = [`📞 **${message.author.username}**#${message.author.discriminator}: ${content}`];
      if (message.attachments.size > 0) {
        msg.push('', this.client.__(destSettings.misc.locale, 'telephone.attachments'));
        message.attachments.forEach(a => msg.push(`- **${a.filename}** - <${a.url}>`));
      }

      this.client.sendMessage(call[destination].id, msg.join('\n'));
      this.client.database.updateDocument('calls', call.id, { active: Date.now() });
    }
  }
}

module.exports = PhoneUtil;
