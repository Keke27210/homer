/* eslint-disable no-bitwise */
const { BitField } = require('discord.js');

class UserFlags extends BitField {
  constructor(bits) {
    super(bits);

    /**
     * Whether the flags have been fetched
     * @type {boolean}
     */
    this.fetched = !(typeof bits === 'undefined');
  }
}

UserFlags.FLAGS = {
  DISCORD_EMPLOYEE: 1 << 0,
  DISCORD_PARTNER: 1 << 1,
  HYPESQUAD_EVENTS: 1 << 2,
  BUGHUNTER_LEVEL1: 1 << 3,
  HOUSE_BRAVERY: 1 << 6,
  HOUSE_BRILLANCE: 1 << 7,
  HOUSE_BALANCE: 1 << 8,
  EARLY_SUPPORTER: 1 << 9,
  TEAM_USER: 1 << 10,
  SYSTEM: 1 << 12,
  BUGHUNTER_LEVEL2: 1 << 14,
};

module.exports = UserFlags;
