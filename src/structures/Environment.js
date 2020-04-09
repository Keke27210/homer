const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';

class Environment {
  constructor(client, message, type, args, children, embedCode) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
    this.vars = [];
    this.message = message;
    this.guild = null;
    this.member = null;
    this.user = null;
    this.channel = null;
    this.attachments = [];
    this.args = args || [];
    this.embedCode = embedCode || null;
    this.reactions = [];
    this.children = children;
    this.settings = message.settings;

    // eslint-disable-next-line no-underscore-dangle
    this._patch(message, type);
  }

  // eslint-disable-next-line no-underscore-dangle
  _patch(message, type) {
    if (type === 'tag') {
      this.guild = message.guild;
      this.member = message.member || null;
      this.user = message.author;
      this.channel = message.channel;
      this.attachments = message.attachments.map((a) => a.url);

      let code = '';
      for (let i = 0; i < 5; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
      this.embedCode = code;
    } else if (type === 'childrenTag') {
      this.guild = message.guild;
      this.member = message.member;
      this.user = message.user;
      this.channel = message.channel;
      this.attachments = message.attachments;
      this.children = true;
    }
  }
}

module.exports = Environment;
