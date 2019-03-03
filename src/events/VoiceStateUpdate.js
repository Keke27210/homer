const Event = require('../structures/Event');

class VoiceStateUpdate extends Event {
  constructor(client) {
    super(client, 'voiceStateUpdate');
  }

  async handle(oldMember, newMember) {
    const settings = await this.client.database.getDocument('settings', newMember.guild.id);
    if (!settings) return;

    // Delete the inactivity mark if the bot has left a voice channel
    if (newMember.id === this.client.user.id && !newMember.voiceChannel) {
      if (this.client.radio.inactivity[newMember.guild.id]) {
        delete this.client.radio.inactivity[newMember.guild.id];
      }
    }

    // Prevent bot to be moved to a non-radio channel
    if (!this.client.shazamWork.includes(newMember.guild.id) && newMember.id === this.client.user.id) {
      if (newMember.voiceChannel && (newMember.voiceChannel.id !== settings.radio.channel)) {
        newMember.voiceChannel.leave();
      }
    }

    // Mark the session as inactive if the bot is alone
    const radioChannel = this.client.channels.get(settings.radio.channel);
    if (radioChannel) {
      if (radioChannel.members.filter(m => !m.user.bot).size === 0) this.client.radio.inactivity[newMember.guild.id] = Date.now();
      else delete this.client.radio.inactivity[newMember.guild.id];
    }
  }
}

module.exports = VoiceStateUpdate;
