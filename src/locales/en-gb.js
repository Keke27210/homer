module.exports = {
  /* LOCALE INFORMATION */
  _: {
    code: 'en-gb',
    name: 'English (United Kingdom)',
    revision: 1585945683368,
    authors: ['205427654042583040'],
  },

  /* GLOBAL */
  global: {
    none: 'None',
    at: 'at',
    yes: 'Yes',
    no: 'No',
    unknown: 'Unknown',
  },

  database: {
    notReady: 'This feature relies on the database which is currently unavailable. We apologize for this.',
  },

  /* UTILS */
  // Finder
  finder: {
    channels: {
      zero: (search) => `No channels found matching \`${search}\`.`,
    },
    members: {
      zero: (search) => `No members found matching \`${search}\`.`,
    },
    roles: {
      zero: (search) => `No roles found matching \`${search}\`.`,
    },
    format: {
      channels: (size, search) => `**${size}** channels found matching \`${search}\`:`,
      members: (size, search) => `**${size}** members found matching \`${search}\`:`,
      roles: (size, search) => `**${size}** roles found matching \`${search}\`:`,
    },
  },

  /* HANDLERS */
  // Command handler
  command: {
    error: 'An error occured during the execution of this command. Please try again or join the support server.',
    noDm: 'This command cannot be ran in a DM environment.',
    userPermissions: (permissions) => `You need the following permissions to run this command: ${permissions}.`,
    botPermissions: (permissions) => `I need the following permissions to run this command: ${permissions}.`,
  },

  /* COMMANDS */
  // About command
  about: {
    title: (emote, name) => `${emote} Information about **${name}**:`,
    developers: 'Developers',
    version: 'Homer revision',
    node: 'Node.js',
    djs: 'discord.js',
  },

  // Avatar command
  avatar: {
    title: (name) => `🖼️ ${name}'s avatar:`,
  },

  // Channel command
  channel: {
    title: (name, type) => `🗺️ Information about **${type === 'text' ? '#' : ''}${name}**:`,
    id: 'Discord ID',
    type: 'Type',
    position: 'Position',
    users: 'Users',
    slowdown: 'Slowdown',
    bitrate: 'Bitrate',
    creation: 'Creation date',
    topic: 'Topic',
    types: {
      category: 'Category',
      text: 'Text',
      voice: 'Voice',
      news: 'News',
      store: 'Store',
    },
  },

  // Dial command
  dial: {
    number: 'You must provide a number to dial.',
    unknown: (number) => `The number \`${number}\` is not assigned.`,
    error: {
      busy: 'Your correspondent is busy.',
    },
  },

  // Google command
  google: {
    noSearch: 'You must provide something to search.',
    unavailable: 'Google search is temporarily unavailable. We apologize for this.',
    searching: 'Searching...',
    noResults: (search) => `No search results matching \`${search}\`.`,
    error: 'An error occured while querying Google. We apologize for this.',
  },

  // Hangup command
  hangup: {
    none: 'There are no active calls at this time.',
  },

  // Lookup command
  lookup: {
    noSearch: 'You must provide something to look for.',
    looking: 'Looking...',
    noResults: (search) => `No Discord entity found matching \`${search}\`.`,
    invite: {
      title: (code) => `📧 Information about invitation **${code}**:`,
      server: 'Server',
      inviter: 'Inviter',
      channel: 'Channel',
      members: 'Members',
      creation: 'Server creation date',
      memberDesc: (total, online, emote) => `**${total}** including ${emote} **${online}**`,
    },
    server: {
      widgetDisabled: (id) => `Server found matching ID \`${id}\` but no further information available.`,
      title: (name) => `🖥️ Information about server **${name}**:`,
      id: 'Discord ID',
      members: 'Members',
      channels: 'Channels',
      invite: 'Invite',
      creation: 'Creation date',
    },
    user: {
      title: (emote, name) => `${emote} Information about ${name}:`,
      id: 'Discord ID',
      creation: 'Creation date',
    },
  },

  // Pickup command
  pickup: {
    noPending: '☎️ There are no pending calls.',
    asCaller: 'You can\'t pick up as a caller.',
  },

  // Ping command
  ping: {
    pong: (ws) => `🏓 Pong with **${ws}** milliseconds!`,
  },

  // Role command
  role: {
    title: (name) => `🎭 Information about role **${name}**:`,
    id: 'Discord ID',
    color: 'Color',
    position: 'Position',
    memberCount: 'Member count',
    managed: 'Managed',
    mentionable: 'Mentionable',
    hoisted: 'Hoisted',
    permissions: 'Permissions',
    creation: 'Creation date',
  },

  // Server command
  server: {
    title: (name, pub) => `🖥️ Information about${pub ? ' public' : ''} server **${name}**:`,
    id: 'Discord ID',
    owner: 'Owner',
    region: 'Region',
    boost: 'Server boost',
    members: 'Members',
    memberDesc: (total, online, bots, eOnline, eBot) => `**${total}** including **${online}** ${eOnline} and **${bots}** ${eBot}`,
    channels: 'Channels',
    creation: 'Creation date',
    boosts: {
      level: (level) => `Level ${level}`,
      count: (count) => `${count} booster${count > 1 ? 's' : ''}`,
    },
    channel: {
      category: 'Category',
      text: 'Text',
      voice: 'Voice',
    },
    regions: {
      amsterdam: 'Amsterdam',
      brazil: 'Brazil',
      dubai: 'Dubai',
      europe: 'Europe',
      'eu-central': 'Central Europe',
      'eu-east': 'Eastern Europe',
      'eu-west': 'Western Europe',
      frankfurt: 'Frankfurt',
      hongkong: 'Hong Kong',
      india: 'India',
      japan: 'Japan',
      london: 'London',
      russia: 'Russia',
      singapore: 'Singapore',
      southafrica: 'South Africa',
      sydney: 'Sydney',
      'us-central': 'US Central',
      'us-east': 'US East',
      'us-south': 'US South',
      'us-west': 'US West',
    },
  },

  // Telephone command
  telephone: {
    welcome: (command) => `☎️ Welcome to Homer's phone! To begin, run \`${command}\`.`,
    pending: '☎️ Your subscription request is being processed. You will receive the decision on this channel as soon as it is available.',
    occupiedChannel: (id) => `The contract n°${id} is already active on this channel.`,
    unusedChannel: 'There are no active subscription on this channel.',
    contractRequired: (command) => `A phone subscription is required to use this feature. Use the ${command} command for more information.`,
    notification: {
      approved: (number, command) => `☎️ Your subscription request has been accepted! The number \`${number}\` has been assigned to your contract. Start calling with \`${command}\`!`,
      denied: '☎️ Your subscription request has been rejected. You can contact the support server to find out why.',
    },
    call: {
      incoming: (number, command) => `☎️ Incoming call from **${number}**... Use \`${command}\` to pickup!`,
      outgoing: (number) => `☎️ Outgoing call to **${number}**...`,
      handler: (name, content) => `📞 ${name}: ${content}`,
      pickup: (source) => ['📞 Your caller picked up.', '📞 You picked up the phone.'][source],
      ended: {
        user: (source) => ['☎️ Your caller hung up.', '📞 You hung up the phone.'][source],
        error: '☎️ A problem occurred, communication was interrupted.',
      },
    },
    contract: {
      title: '☎️ Information about this channel\'s contract:',
      id: 'Contract no.',
      number: 'Number',
      subscriber: 'Subscriber',
      state: 'State',
      textable: 'Textable',
      date: 'Subscription date',
      notAttributed: 'Not attributed yet',
      states: {
        0: 'Awaiting approval...',
        1: 'Active',
      },
    },
    subscribe: {
      disclaimer: (name) => `Are you sure you want to apply for a contract for the channel **#${name}**?`,
      eligibility: 'Checking eligibility...',
      applied: (id) => `Your subscription request has been sent successfully, you will receive an answer shortly. Note your contract number n°\`${id}\`.`,
      aborted: 'The subscription request has been cancelled.',
      error: {
        guild: {
          too_many: (max) => `This server cannot have more than ${max} contracts active simultaneously.`,
          recent_contracts: 'At least two contracts have already been signed on this server in the last two weeks. You have to wait before you can sign them again.',
          suspended_contracts: 'A line belonging to this server has been suspended by support. You must wait at least four weeks from the date of suspension to sign new contracts.',
        },
        user: {
          too_many: (max) => `You cannot have more than ${max} contracts active simultaneously.`,
          recent_contracts: 'You\'ve already signed two contracts in the last two weeks. You have to wait before you can sign more.',
          suspended_contracts: 'A line for which you are responsible has been suspended by the support. You must wait at least four weeks from the date of suspension to sign new contracts.',
        },
      },
    },
    terminate: {
      disclaimer: 'Are you sure you want to break the contract thus ending your subscription? Keep in mind that you are limited to two signatures every two weeks.',
      error: 'An error occurred during the termination of your contract.',
      done: (id) => `Contract n°\`${id}\` has been terminated. The associated phone line is no longer available.`,
      aborted: 'The request for termination of contract has been cancelled.',
    },
  },

  // User command
  user: {
    title: (emote, name) => `${emote} Information about ${name}:`,
    id: 'Discord ID',
    nickname: 'Nickname',
    status: 'Status',
    activity: 'Activity',
    roles: 'Roles',
    creation: 'Creation date',
    join: 'Join date',
    activities: {
      streaming: (name) => `Streaming **${name}**`,
      playing: (name) => `Playing **${name}**`,
      listening: (details, name) => `Listening to **${details}** on ${name}`,
      watching: (name) => `Watching **${name}**`,
    },
    statusDesc: {
      online: 'Online',
      idle: 'Idle',
      dnd: 'Do not disturb',
      offline: 'Offline',
    },
  },
};
