const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

class Environment {
  constructor(client, object, type, args, children, embedCode) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
    this.vars = [];
    this.guild = null;
    this.member = null;
    this.user = null;
    this.channel = null;
    this.attachments = [];
    this.args = args || [];
    this.embedCode = embedCode || null;
    this.reactions = [];
    this.children = children;
    this.settings = object.settings;

    this._patch(object, type);
  }

  _patch(object, type) {
    if (type === 'tag') {
      this.guild = object.message.guild;
      this.member = object.message.member || null;
      this.user = object.message.author;
      this.channel = object.message.channel;
      this.attachments = object.message.attachments.map(a => a.url);

      let code = '';
      for (let i = 0; i < 5; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
      this.embedCode = code;
    } else if (type === 'memberlog') {
      this.guild = object.guild;
      this.member = object;
      this.user = object.user;
      this.channel = object.channel;
      this.children = true;
    } else if (type === 'childrenTag') {
      this.guild = object.guild;
      this.member = object.member;
      this.user = object.user;
      this.channel = object.channel;
      this.attachments = object.attachments;
      this.children = true;
    }
  }
}

module.exports = Environment;
