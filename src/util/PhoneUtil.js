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
      else return call.receivers.find(r => r.id === id);
    }) ? 1 : 0;
  }

  async addHistory(channel, action, user, number) {
    const subscription = this.client.database.getDocument('telephone', channel);
    if (!subscription) return;

    if (!subscription.history) subscription.history = [];
    subscription.history.push({
      action,
      user,
      number,
      time: Date.now(),
    });

    return this.client.database.updateDocument('telephone', channel, { history: subscription.history });
  }

  async handleMessage(message) {
    if (message.author.bot) return;

    const blacklist = await this.client.database.getDocument('blacklist', message.author.id);
    if (blacklist) return;

    const calls = await this.client.database.getDocuments('calls', true);
    const call = calls.find(c => c.type === 0 ? [c.sender.id, c.receiver.id].includes(message.channel.id) : c.receivers.find(r => r.id === message.channel.id));
    if (!call) return;
    this.client.database.updateDocument('calls', call.id, { active: Date.now() });

    if (call.type === 0) {
      if (call.state === 0) return;

      const destination = call.sender.id === message.channel.id ? 'receiver' : 'sender';
      const destSettings = await this.client.database.getDocument('settings', call[destination].settings);
      if (destSettings && destSettings.ignored && destSettings.ignored.includes(message.author.id)) return;

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
    } else {
      const destinations = call.receivers.filter(r => r.id !== message.channel.id);
      const { number, state } = call.receivers.find(r => r.id === message.channel.id);

      // Removing link auto-embed
      let content = message.cleanContent;
      const linkTest = content.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm);
      for (const link of linkTest || []) content = content.replace(link, `<${link}>`);
      const attachments = message.attachments.map(a => `- **${a.filename}** - <${a.url}>`);

      for (let i = 0; i < destinations.length; i += 1) {
        const destination = destinations[i];
        if (state === 0 || destination.state === 0) continue;

        const destSettings = await this.client.database.getDocument('settings', destination.settings);
        if (destSettings && destSettings.ignored && destSettings.ignored.includes(message.author.id)) continue;

        const contact = destination.contacts.find(c => c.number === number);
        const identity = contact ? `**${contact.description}** / **${number}**` : `**${number}**`;

        const msg = [`📞 **${message.author.username}**#${message.author.discriminator} (${identity}): ${content}`];
        if (message.attachments.size > 0) {
          msg.push('', this.client.__(destSettings.misc.locale, 'telephone.attachments'), attachments.join('\n'));
        }

        this.client.sendMessage(destination.id, msg.join('\n'));
      }
    }
  }
}

module.exports = PhoneUtil;
