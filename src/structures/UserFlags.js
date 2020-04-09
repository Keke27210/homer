/* eslint-disable no-bitwise */
const { BitField } = require('discord.js');

class UserFlags extends BitField {}

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
  VERIFIED_BOT: 1 << 16,
  VERIFIED_DEVELOPER: 1 << 17,
};

module.exports = UserFlags;
