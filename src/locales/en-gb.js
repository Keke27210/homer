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

  /* HELP */
  help: {
    about: {
      description: 'Information about the bot',
      usage: null,
      example: null,
    },
    avatar: {
      description: 'Displays a member\'s avatar',
      usage: '[member]',
      example: '@Luke',
    },
    channel: {
      description: 'Displays information about a channel',
      usage: '[channel]',
      example: '#general',
    },
    dial: {
      description: 'Dials a telephone number',
      usage: '<number>',
      example: 'SUPPORT',
    },
    eval: {
      description: 'Evaluates Javascript code',
      usage: '[code]',
      example: 'this.client.token',
    },
    google: {
      description: 'Searches for an information on Google',
      usage: '<search>',
      example: 'Facebook\'s owner',
    },
    hangup: {
      description: 'Ends an ongoing call',
      usage: null,
      example: null,
    },
    lookup: {
      description: 'Displays information on a Discord entity (user/guild/invite/gift)',
      usage: '<id/invite/gift code>',
      example: '205427654042583040',
    },
    ping: {
      description: 'Pong with WebSocket\'s latency',
      usage: null,
      example: null,
    },
    phonebook: {
      description: 'Displays Homer\'s phone book',
      usage: null,
      example: null,

      message: {
        description: 'Sets a description for the line',
        usage: '<message>',
        example: 'Domino\'s Pizza',
      },
      toggle: {
        description: 'Toggles visibility in the phone book',
        usage: null,
        example: null,
      },
    },
    pickup: {
      description: 'Answers to an incoming call',
      usage: null,
      example: null,
    },
    radio: {
      description: 'Sets the radio channel',
      usage: '[channel]',
      example: 'Music',
    },
    role: {
      description: 'Displays information about a role',
      usage: '<role>',
      example: '@Moderators',

      members: {
        description: 'Displays member having the specified role',
        usage: '<role>',
        example: '@Muted',
      },
    },
    server: {
      description: 'Displays information about the server',
      usage: null,
      example: null,
    },
    shutdown: {
      description: 'Gracefully shuts down the bot',
      usage: '[exit code]',
      example: '4',
    },
    telephone: {
      description: 'Displays information about a channel\'s contract',
      usage: null,
      example: null,

      contracts: {
        description: 'Displays all pending contracts',
        usage: null,
        example: null,

        approve: {
          description: 'Approves a subscription request',
          usage: '<contract no.>',
          example: null,
        },
        reject: {
          description: 'Rejects a subscription request',
          usage: '<contract no.>',
          example: null,
        },
      },
      subscribe: {
        description: 'Subscribes to Homer\'s telephone',
        usage: null,
        example: null,
      },
      terminate: {
        description: 'Terminates a subscription',
        usage: null,
        example: null,
      },
      toogle: {
        description: 'Pauses or resumes a telephone line',
        usage: null,
        example: null,
      },
    },
    text: {
      description: 'Sends a text message to someone',
      usage: '<number> <message>',
      example: '478-444 Hey, call me back!',
    },
    volume: {
      description: 'Sets radio volume (in percentage)',
      usage: '<volume>',
      example: '75',
    },
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
    noNumber: 'You must provide a number to dial.',
    unknown: 'The number you dialed is not assigned.',
    busy: 'The line\'s busy.',
    correspondentBusy: 'Your correspondent line\'s busy.',
    error: 'An error occurred while dialing.',
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
    noActive: '☎️ You\'re not on a phone call..',
    error: 'An error occurred while hanging up.',
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

  // Phonebook command
  phonebook: {
    title: '🔖 Homer\'s phone book:',
    empty: 'The phone book is currently empty.',
    toggle: {
      visible: 'You are now listed in the phone book.',
      invisible: 'You are no longer listed in the phone book.',
      message: 'You must have defined a description for your line.',
      error: 'An error occurred during the phone book subscription request.',
    },
    message: {
      set: (message) => `You now appear in the phone book with the description: \`${message}\`.`,
      length: (max) => `The length of your description should not exceed **${max}** characters.`,
      missing: 'You must provide a description to be defined.',
      error: 'An error occurred while editing your description.',
    },
  },

  // Pickup command
  pickup: {
    noPending: 'There are no incoming calls.',
    asCaller: 'You can\'t pick up as a caller.',
    error: 'An error occurred while picking up.',
  },

  // Ping command
  ping: {
    pong: (ws) => `🏓 Pong with **${ws}** milliseconds!`,
  },

  // Radio command
  radio: {
    none: 'Run this command while being on a voice channel or specify a voice channel name.',
    set: (name) => `Radio channel is set to **${name}**.`,
    error: 'An error occured while setting radio channel.',
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
    members: {
      title: (name) => `🎭 Members in role **${name}**:`,
      empty: (name) => `Role **${name}** has no members.`,
    },
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
    welcome: '☎️ Welcome to Homer\'s telephone! To get started, run `h:telephone subscribe`.',
    existing: (id) => `Contract no. \`${id}\` is already active on this channel.`,
    unknown: '☎️ No contract present on this channel. Subscribe by running `h:telephone subscribe`.',
    pending: '☎️ Your subscription request is in progress, please wait.',
    paused: '☎️ You must reactivate your line before you can use it.',
    contract: {
      title: '☎️ Information about this channel\'s contract:',
      id: 'Contract no.',
      number: 'Number',
      subscriber: 'Subscriber',
      state: 'State',
      textable: 'Textable',
      date: 'Subscription date',
      noNumber: 'Not assigned',
    },
    notifications: {
      activated: (number) => `☎️ Your line has been activated, your number is \`${number}\`.`,
      invalidated: 'Your line has not been activated. Join the support server to find out why.',
      outgoing: (number) => `📞 Dialing \`${number}\`...`,
      incoming: (number) => `📞 Incoming call from \`${number}\`. Run \`h:pickup\` to pickup the phone.`,
      pickedCaller: '📞 Your correspondent picked up.',
      pickedCalled: '📞 You picked up the phone.',
      terminated: '📞 The communication has ended.',
      paused: '☎️ Your line\'s been disabled. You can reactivate it at any time by running `h:telephone toggle`.',
      resumed: '☎️ Your line\'s been reactivated.',
      text: (num) => `📧 Received text message from \`${num}\`:`,
    },
    states: {
      0: 'Pending',
      1: 'Active',
      2: 'Paused',
      3: 'Terminated',
      4: 'Suspended',
      5: 'Invalidated',
    },
    subscribe: {
      disclaimer: 'Do you really want to apply for a subscription for this channel?',
      eligibility: 'Checking eligibility...',
      notEligible: 'You are not eligible to Homer\'s telephone.',
      applied: (id) => `Your subscription request has been made. Your contract number: \`${id}\`.`,
      error: 'An error occurred during your subscription request.',
      aborted: 'You have cancelled your subscription request.',
    },
    terminate: {
      disclaimer: 'Are you sure you want to terminate your contract? You are limited to two signatures every two weeks.',
      done: (id) => `Contract no. \`${id}\` was successfully terminated.`,
      error: 'There was an error in your termination request.',
      aborted: 'You have cancelled your termination request.',
    },
    toggle: {
      error: 'An error occurred while processing your request.',
    },
    hint: {
      text: (num) => `Reply to this message using h:text ${num} <message>`,
    },
  },

  // Text command
  text: {
    missingNumber: 'You must provide a number to send a message to.',
    missingContent: 'You must provide message to be sent.',
    contentLength: (max) => `The length of the message must not exceed **${max}** characters.`,
    unable: (number) => `Unable to send a text message to \`${number}\`.`,
    sent: (number) => `Your message has been successfully sent to \`${number}\`.`,
    error: 'An error occurred while sending your message.',
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

  // Volume command
  volume: {
    missing: 'You must provide a volume to set',
    number: 'The volume must be a number',
    range: 'The volume must be between 0 and 100.',
    set: (volume) => `The volume is now at \`${volume}%\`.`,
    error: 'An error occured while setting volume.',
  },
};
