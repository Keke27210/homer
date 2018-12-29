const Event = require('../structures/Event');

class VoiceStateUpdate extends Event {
  constructor(client) {
    super(client, 'voiceStateUpdate');
  }

  async handle(oldMember, newMember) {
    const settings = await this.client.database.getDocument('settings', newMember.guild.id);
    if (!settings) return;

    // Prevent bot to be moved to a non-radio channel
    if (newMember.id === this.client.user.id) {
      if (newMember.voiceChannel && (newMember.voiceChannel.id !== settings.radio.channel)) {
        newMember.voiceChannel.leave();
      }
    }

    // Mark the session as inactive if the bot is alone
    const radioChannel = this.client.channels.get(settings.radio.channel);
    if (radioChannel) {
      if (radioChannel.members.filter(m => !m.user.bot).size === 0) this.inactivity[newMember.guild.id] = Date.now();
      else delete this.inactivity[newMember.guild.id];
    }
  }
}

module.exports = VoiceStateUpdate;
