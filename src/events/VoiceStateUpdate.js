const Event = require('../structures/Event');

class VoiceStateUpdate extends Event {
  constructor(client) {
    super(client, 'voiceStateUpdate');
  }

  async handle(oldMember, newMember) {
    const settings = await this.client.database.getDocument('settings', newMember.guild.id);
    if (!settings) return;

    if (newMember.id === this.client.user.id) {
      if (newMember.voiceChannel && (newMember.voiceChannel.id !== settings.radio.channel)) {
        await newMember.voiceChannel.leave();
        delete this.client.currentBroadcasts[context.message.guild.id];
        this.client.clearBroadcasts();
      }
    }
  }
}

module.exports = VoiceStateUpdate;
