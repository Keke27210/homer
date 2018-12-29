const Event = require('../structures/Event');

class ChannelDeleteEvent extends Event {
  constructor(client) {
    super(client, 'channelDelete');
  }

  async handle(channel) {
    if (channel.guild) {
      this.client.database.getDocument('settings', channel.guild.id).then((settings) => {
        if (!settings) return;

        // Ignored channels
        if (settings.ignored.find(i => i.id === channel.id)) {
          settings.ignored.splice(settings.ignored.findIndex(i => i.id === channel.id), 1);
        }

        // Radio channel
        if (settings.radio.channel === channel.id) {
          settings.radio.channel = null;
        }

        this.client.database.insertDocument(
          'settings',
          settings,
          { conflict: 'update' },
        );
      });
    }

    // Deleting phone subscription
    this.client.other.deleteSub(channel.id);
  }
}

module.exports = ChannelDeleteEvent;
