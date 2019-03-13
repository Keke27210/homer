class Routine {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
  }
}

module.exports = Routine;
