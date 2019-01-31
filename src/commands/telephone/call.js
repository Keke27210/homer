const Command = require('../../structures/Command');

class CallCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'call',
      aliases: ['dial'],
      category: 'telephone',
      children: [new AddSubcommand(client), new RemoveSubcommand(client)],
      usage: '<number> [numbers...]',
      dm: true,
    });
  }

  async execute(context) {
    const status = await this.client.database.getDocument('bot', 'settings').then(s => s.telephone);
    if (!status) return context.replyWarning(context.__('telephone.unavailable'));

    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const currentStatus = await this.client.telephone.getStatus(context.message.channel.id);
    if (currentStatus !== 0) return context.replyWarning(context.__('call.inCall'));

    const numbers = context.args.map(a => a.toUpperCase());
    if (numbers.length === 0) return context.replyError(context.__('call.noNumber'));
    if (numbers.find(n => n === subscription.number)) return context.replyError(context.__('call.self'));

    // Normal calls
    if (numbers.length === 1) {
      const correspondent = await this.client.database.findDocuments('telephone', { number: numbers[0] }).then(a => a[0]);
      if (!correspondent) return context.replyWarning(context.__('telephone.unassignedNumber', { number: numbers[0] }));

      const correspondentStatus = await this.client.telephone.getStatus(correspondent.id);
      if (correspondentStatus !== 0) return context.replyWarning(context.__('call.busyCorrespondent'));

      const blacklistStatus = correspondent.blacklist.find(b => b.channel === subscription.id || b.number === subscription.number);
      if (blacklistStatus) return context.replyError(context.__('call.blacklisted'));

      const contact = correspondent.contacts.find(c => c.number === subscription.number);
      const identity = contact ? `**${contact.description}** (**${contact.number}**)` : `**${subscription.number}**`;
      const correspondentContact = subscription.contacts.find(c => c.number === correspondent.number);
      const correspondentIdentity = correspondentContact ? `**${correspondentContact.description}** (**${correspondentContact.number}**)` : `**${correspondent.number}**`;
      const correspondentLanguage = await this.client.database.getDocument('settings', correspondent.id).then(a => a ? a.misc.locale : this.client.localization.defaultLocale);

      subscription.locale = context.settings.misc.locale;
      subscription.message = await this.client.sendMessage(
        subscription.id,
        context.__('telephone.outgoing', { identity: correspondentIdentity }),
      ).then(m => m.id);

      correspondent.locale = correspondentLanguage;
      correspondent.message = await this.client.sendMessage(
        correspondent.id,
        this.client.__(correspondentLanguage, 'telephone.incoming', { identity }),
      ).then(m => m.id);

      this.client.database.insertDocument('phoneLog', { id: subscription.number, type: 0, target: numbers[0], time: Date.now() });
      this.client.database.insertDocument('phoneLog', { id: correspondent.number, type: 1, target: subscription.number, time: Date.now() });

      await this.client.database.insertDocument('calls', {
        sender: subscription,
        receiver: correspondent,
        start: Date.now(),
        active: Date.now(),
        state: 0,
        type: 0,
      });
    }

    // Group calls
    else {
      if (!this.client.other.isDonator(context.message.author.id)) return context.replyError(context.__('call.cannotGroup'));

      subscription.state = 1;
      subscription.locale = context.settings.misc.locale;
      subscription.main = true;
      const receivers = [subscription];
      if (numbers.length > 4) return context.replyError(context.__('call.manyNumbers'));

      for (let i = 0; i < numbers.length; i += 1) {
        const number = numbers[i];

        const correspondent = await this.client.database.findDocuments('telephone', { number }).then(a => a[0]);
        if (!correspondent) return context.replyWarning(context.__('telephone.unassignedNumber', { number }));

        const correspondentStatus = await this.client.telephone.getStatus(correspondent.id);
        if (correspondentStatus !== 0) return context.replyWarning(context.__('call.busyCorrespondent', { number }));

        const blacklistStatus = correspondent.blacklist.find(b => b.channel === subscription.id || b.number === subscription.number);
        if (blacklistStatus) return context.replyError(context.__('call.blacklisted', { number }));

        const contact = correspondent.contacts.find(c => c.number === subscription.number);
        const identity = contact ? `**${contact.description}** (**${contact.number}**)` : `**${subscription.number}**`;

        correspondent.start = Date.now();
        correspondent.state = 0;
        correspondent.locale = await this.client.database.getDocument('settings', correspondent.settings).then(a => a ? a.misc.locale : this.client.localization.defaultLocale);
        correspondent.message = await this.client.sendMessage(
          correspondent.id,
          this.client.__(correspondent.locale, 'telephone.incomingGroup', { identity }),
        ).then(m => m.id);

        receivers.push(correspondent);
      }

      await this.client.database.insertDocument('calls', {
        receivers,
        start: Date.now(),
        active: Date.now(),
        state: 0,
        type: 1,
      });

      context.reply(context.__('telephone.outgoingGroup', {
        numbers: receivers.filter(r => r.number !== subscription.number).map(r => `\`${r.number}\``).join(', '),
      }));
    }
  }
}

class AddSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      aliases: ['invite'],
      category: 'telephone',
      usage: '<number>',
      dm: true,
    });
  }

  async execute(context) {
    if (!this.client.other.isDonator(context.message.author.id)) return context.replyError(context.__('call.cannotGroup'));

    const status = await this.client.database.getDocument('bot', 'settings').then(s => s.telephone);
    if (!status) return context.replyWarning(context.__('telephone.unavailable'));

    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const call = await this.client.database.getDocuments('calls', true)
      .then(calls => calls.find(c => c.type === 1 && c.receivers.find(r => r.main && r.id === context.message.channel.id)));
    if (!call) return context.replyError(context.__('call.notGroup'));
    if (call.receivers.length >= 5) return context.replyWarning(context.__('call.manyNumbers'));

    const number = context.args[0] ? context.args[0].toUpperCase() : null;
    if (!number) return context.replyError(context.__('call.add.noNumber'));
    if (number === subscription.number) return context.replyError(context.__('call.self'));

    const correspondent = await this.client.database.findDocuments('telephone', { number }).then(a => a[0]);
    if (!correspondent) return context.replyWarning(context.__('telephone.unassignedNumber', { number }));

    const correspondentStatus = await this.client.telephone.getStatus(correspondent.id);
    if (correspondentStatus !== 0) return context.replyWarning(context.__('call.busyCorrespondent', { number }));

    const blacklistStatus = correspondent.blacklist.find(b => b.channel === subscription.id || b.number === subscription.number);
    if (blacklistStatus) return context.replyError(context.__('call.blacklisted', { number }));

    const contact = correspondent.contacts.find(c => c.number === number);
    const identity = contact ? `**${contact.description}** (**${contact.number}**)` : `**${number}**`;

    correspondent.start = Date.now();
    correspondent.state = 0;
    correspondent.locale = await this.client.database.getDocument('settings', correspondent.settings).then(a => a ? a.misc.locale : this.client.localization.defaultLocale);
    correspondent.message = await this.client.sendMessage(
      correspondent.id,
      this.client.__(correspondent.locale, 'telephone.incomingGroup', { identity }),
    ).then(m => m.id);

    call.receivers.push(correspondent);
    await this.client.database.updateDocument('calls', call.id, { receivers: call.receivers });
    context.reply(context.__('call.add.adding', {
      identity,
    }));
  }
}

class RemoveSubcommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      aliases: ['kick'],
      category: 'telephone',
      usage: '<number>',
      dm: true,
    });
  }

  async execute(context) {
    if (!this.client.other.isDonator(context.message.author.id)) return context.replyError(context.__('call.cannotGroup'));

    const status = await this.client.database.getDocument('bot', 'settings').then(s => s.telephone);
    if (!status) return context.replyWarning(context.__('telephone.unavailable'));

    const subscription = await this.client.database.getDocument('telephone', context.message.channel.id);
    if (!subscription) return context.replyWarning(context.__('telephone.noSubscription', { command: `${this.client.prefix}telephone subscribe` }));

    const call = await this.client.database.getDocuments('calls', true)
      .then(calls => calls.find(c => c.type === 1 && c.receivers.find(r => r.main && r.id === context.message.channel.id)));
    if (!call) return context.replyError(context.__('call.notGroup'));
    if (call.receivers.length >= 5) return context.replyWarning(context.__('call.manyNumbers'));

    const number = context.args[0] ? context.args[0].toUpperCase() : null;
    if (!number) return context.replyError(context.__('call.remove.noNumber'));
    if (number === subscription.number) return context.replyError(context.__('call.self'));

    const correspondent = await call.receivers.find(r => r.number === number);
    if (!correspondent) return context.replyError(context.__('call.remove.noCorrespondent', { number }));

    const contact = correspondent.contacts.find(c => c.number === number);
    const identity = contact ? `**${contact.description}** (**${contact.number}**)` : `**${number}**`;

    call.receivers.splice(call.receivers.indexOf(correspondent), 1);
    this.client.sendMessage(correspondent.id, this.client.__(correspondent.locale, 'telephone.groupKick'));
    context.reply(context.__('call.remove.removed', {
      identity,
    }));

    if (call.receivers.length > 1) {
      this.client.database.updateDocument('calls', call.id, { receivers: call.receivers });
    } else {
      this.client.sendMessage(subscription.id, this.client.__(subscription.locale, 'telephone.emptyGroup'));
      this.client.database.deleteDocument('calls', call.id);
    }
  }
}

module.exports = CallCommand;
