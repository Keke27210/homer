class Environment {
  constructor(client, object, type, args, children) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
    this.vars = [];
    this.guild = null;
    this.member = null;
    this.user = null;
    this.channel = null;
    this.args = args || [];
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
      this.children = true;
    }
  }
}

module.exports = Environment;
