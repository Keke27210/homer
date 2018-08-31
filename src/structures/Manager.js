class Manager {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
  }
}

module.exports = Manager;
