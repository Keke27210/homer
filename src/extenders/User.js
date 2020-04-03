const { Structures } = require('discord.js');

Structures.extend('User', (User) => {
  class CustomUser extends User {
    /**
     * Returns the user tag following Homer design
     * @type {string}
     */
    get tag() {
      return `**${this.username}**#${this.discriminator}`;
    }
  }

  return CustomUser;
});
