module.exports = (dot) => ({
  /* LOCALE INFORMATION */
  _: {
    code: 'fr-fr',
    name: 'Français (France)',
    revision: 1585945683368,
    authors: ['205427654042583040'],
  },

  /* GLOBAL */
  global: {
    none: 'Aucun',
    at: 'à',
    yes: 'Oui',
    no: 'Non',
    unknown: 'Inconnu',
    loading: 'Chargement...',
    more: (num) => `et **${num}** autres...`,
  },

  database: {
    notReady: 'Cette fonctionnalité repose sur la base de données qui est actuellement indisponible. Nous nous excusons pour la gêne occasionnée.',
  },

  /* HELP */
  help: {
    // Categories names
    category: {
      bot: 'Bot',
      general: 'Général',
      radio: 'Radio',
      settings: 'Paramètres',
      telephone: 'Téléphone',
      more: 'Plus d\'aide',
    },

    // Help command
    main: '📚 Commandes d\'**Homer**:',
    footer: 'Ajoutez "help" à la fin d\'une commande pour obtenir une aide avancée.',
    cannot: 'Impossible de vous envoyer l\'aide en DM ! Vérifiez que vous acceptez les DMs provenant de membres du serveur.',
    more: (invite) => `Si vous avez des questions sur une fonctionnalité ou que vous rencontrez un bug, rejoignez le **[serveur d'assistance](${invite})** où vous serez rapidement aidé !\nVous pouvez également faire une donation pour supporter le développement d'Homer et recevoir en échange des privilèges plutôt cool.`,

    // Help for a specific command
    sub: (name) => `📚 Aide pour \`${name}\`:`,
    aliases: 'Alias',
    usage: 'Utilisation',
    example: 'Exemple',
    subcommands: 'Sous-commandes',

    // Help for commands
    about: {
      description: 'Informations sur le bot',
      usage: null,
      example: null,
    },
    activities: {
      description: 'Affiche les activités d\'un utilisateur',
      usage: '[membre]',
      example: 'Luke',
    },
    avatar: {
      description: 'Affiche l\'avatar d\'un membre',
      usage: '[membre]',
      example: '@Luke',
    },
    blacklist: {
      description: 'Affiche la liste noire d\'une ligne',
      usage: null,
      example: null,

      add: {
        description: 'Place un numéro sur liste noire',
        usage: '<numéro>',
        example: 'SUPPORT',
      },
      remove: {
        description: 'Retire un numéro de la liste noire',
        usage: '<numéro>',
        example: 'SUPPORT',
      },
    },
    channel: {
      description: 'Affiche des informations sur un salon',
      usage: '[salon]',
      example: '#general',
    },
    dial: {
      description: 'Compose un numéro de téléphone',
      usage: '<numéro>',
      example: 'SUPPORT',
    },
    donators: {
      description: 'Informations sur les donateurs et le processus de donation',
      usage: null,
      example: null,
    },
    eval: {
      description: 'Exécute du code Javascript',
      usage: '[code]',
      example: 'this.client.token',
    },
    formats: {
      description: 'Affiche les formats de date et d\'heure',
      usage: null,
      example: null,

      date: {
        description: 'Paramètre le format d\'affichage de la date',
        usage: '<format>',
        example: 'MM/DD/YYYY',
      },
      time: {
        description: 'Paramètre le format d\'affichage de l\'heure',
        usage: '<format>',
        example: 'HH heures mm minutes ss secondes',
      },
    },
    google: {
      description: 'Cherche une information sur Google',
      usage: '<recherche>',
      example: 'Propriétaire de Facebook',
    },
    hangup: {
      description: 'Raccroche un appel en cours',
      usage: null,
      example: null,
    },
    help: {
      description: 'Affiche ce menu',
      usage: null,
      example: null,
    },
    invite: {
      description: 'Shows the link to invite Homer into your server',
      usage: null,
      example: null,
    },
    language: {
      description: 'Affiche les langues disponibles sur Homer',
      usage: null,
      example: null,
    },
    leave: {
      description: 'Quitte le salon vocal dans lequel Homer se trouve',
      usage: null,
      example: null,
    },
    lookup: {
      description: 'Affiche des informations sur une entité Discord (utilisateur/serveur/invitation/cadeau)',
      usage: '<id/invitation/code cadeau>',
      example: '205427654042583040',
    },
    names: {
      description: 'Affiche les anciens noms d\'un membre',
      usage: '[membre]',
      example: '@You',
    },
    ping: {
      description: 'Pong !',
      usage: null,
      example: null,
    },
    phonebook: {
      description: 'Affiche l\'annuaire téléphonique',
      usage: null,
      example: null,

      message: {
        description: 'Paramètre une message pour la ligne',
        usage: '<message>',
        example: 'Domino\'s Pizza',
      },
      toggle: {
        description: 'Paramètre la visibilité de la ligne',
        usage: null,
        example: null,
      },
    },
    pickup: {
      description: 'Décroche un appel entrant',
      usage: null,
      example: null,
    },
    prefix: {
      description: 'Paramètre un préfixe personnalisé',
      usage: '<préfixe|disable>',
      example: '/',
    },
    radio: {
      description: 'Paramètre le salon vocal pour la radio',
      usage: '[salon]',
      example: 'Music',
    },
    radios: {
      description: 'Affiche la liste des radios disponibles',
      usage: null,
      example: null,
    },
    role: {
      description: 'Affiche des informations sur un rôle',
      usage: '<rôle>',
      example: '@Modérateurs',

      members: {
        description: 'Affiche les membres ayant le rôle spécifié',
        usage: '<rôle>',
        example: '@Punis',
      },
    },
    server: {
      description: 'Affiche des informations sur le serveur',
      usage: null,
      example: null,
    },
    shutdown: {
      description: 'Arrête le bot proprement',
      usage: '[code de sortie]',
      example: '4',
    },
    tag: {
      description: 'Exécute un tag avec le langage de script Lisa',
      usage: '<nom>',
      example: 'discord.js',

      create: {
        description: 'Crée un tag',
        usage: '<nom> <contenu>',
        example: 'discord.js Quelle puissante librairie !',
      },
      delete: {
        description: 'Supprime un tag',
        usage: '<nom>',
        example: 'discord.js',
      },
      list: {
        description: 'Liste les tags créés par un utilisateur',
        usage: '[membre]',
        example: '@b1nZy',
      },
      owner: {
        description: 'Affiche l\'auteur d\'un tag',
        usage: '<nom>',
        example: 'discord.js',
      },
      raw: {
        description: 'Affiche le contenu d\'un tag sans traitement',
        usage: '<nom>',
        example: 'discord.js',
      },
      raw2: {
        description: 'Affiche le contenu d\'un tag dans un codeblock',
        usage: '<nom>',
        example: 'discord.js',
      },
      private: {
        description: 'Paramètre la publicité d\'un tag',
        usage: '<nom>',
        example: 'discord.js',
      },
      source: {
        description: 'Paramètre la publicité de la source d\'un tag',
        usage: '<nom>',
        example: 'discord.js',
      },
    },
    telephone: {
      description: 'Affiche des informations sur un abonnement',
      usage: null,
      example: null,

      contracts: {
        description: 'Affiche les contrats en attente de traitement',
        usage: null,
        example: null,

        approve: {
          description: 'Approuve une demande d\'abonnement',
          usage: '<n° contrat>',
          example: null,
        },
        reject: {
          description: 'Rejète une demande d\'abonnement',
          usage: '<n° contrat>',
          example: null,
        },
      },
      subscribe: {
        description: 'Crée une demande d\'abonnement',
        usage: null,
        example: null,
      },
      terminate: {
        description: 'Met fin à un abonnement',
        usage: null,
        example: null,
      },
      toggle: {
        description: 'Active ou désactive la ligne',
        usage: null,
        example: null,
      },
    },
    text: {
      description: 'Envoie un message textuel à quelqu\'un',
      usage: '<numéro> <message>',
      example: '478-444 Salut, rappelle-moi !',
    },
    timezone: {
      description: 'Paramètre le fuseau horaire',
      usage: '<fuseau horaire>',
      example: 'Europe/Paris',

      list: {
        description: 'Affiche les fuseaux disponibles',
        usage: null,
        example: null,
      },
    },
    tune: {
      description: 'Écoute une station',
      usage: '<fréquence>',
      example: '98.8',
    },
    user: {
      description: 'Affiche des informations sur un utilisateur',
      usage: '[membre]',
      example: '@Homer',
    },
    volume: {
      description: 'Règle le volume de la radio (en pourcent)',
      usage: '<volume>',
      example: '75',
    },
    weather: {
      description: 'Affiche la météo de la ville fournie',
      usage: '<ville>',
      example: 'Paris',
    },
  },

  /* UTILS */
  // Finder
  finder: {
    channels: {
      zero: (search) => `Aucun salon trouvé correspondant à \`${search}\`.`,
    },
    members: {
      zero: (search) => `Aucun membre trouvé correspondant à \`${search}\`.`,
    },
    roles: {
      zero: (search) => `Aucun rôle trouvé correspondant à \`${search}\`.`,
    },
    format: {
      channels: (size, search) => `**${size}** salons trouvés correspondant à \`${search}\`:`,
      members: (size, search) => `**${size}** membres trouvés correspondant à \`${search}\`:`,
      roles: (size, search) => `**${size}** rôles trouvés correspondant à \`${search}\`:`,
    },
  },

  // Menu
  menu: {
    page: (page) => `Page ${page}`,
  },

  /* HANDLERS */
  // Command handler
  command: {
    error: 'Une erreur est survenue lors de l\'exécution de cette commande. Réessayez plus tard ou rejoignez le serveur d\'assistance.',
    noDm: 'Cette commande ne peut pas être exécutée en messages privés.',
    override: 'Une règle de salon empêche la commande de s\'exécuter.',
    userPermissions: (permissions) => `Vous avez besoin des permissions suivantes pour exécuter cette commande : ${permissions}.`,
    botPermissions: (permissions) => `J'ai besoin des permissions suivantes pour exécuter cette commande : ${permissions}.`,
  },

  /* COMMANDS */
  // About command
  about: {
    title: (emote, name) => `${emote} Informations sur **${name}**:`,
    developers: 'Développeurs',
    guilds: 'Serveurs',
    memory: 'Utilisation de RAM',
    versions: 'Versions',
    links: 'Liens',
  },

  // Activities command
  activities: {
    title: (emote, user) => `${emote} Activités de ${user}:`,
    none: (emote, name) => `${emote} ${name} ne fait rien en ce moment.`,
    elapsed: (time) => `Commencé **${time}**`,
    remaining: (time) => `Termine **${time}**`,
    listening: {
      artist: (name) => `Par ${name}`,
      album: (name) => `Sur ${name}`,
    },
    streaming: {
      link: (url) => `**[Regarder ce stream](${url})**`,
    },
    type: {
      PLAYING: (game) => `🎮 Joue à ${game}`,
      STREAMING: (game) => `📡 Diffuse ${game}`,
      LISTENING: (service) => `🎵 Écoute ${service}`,
      WATCHING: (topic) => `📺 Regarde ${topic}`,
    },
  },

  // Avatar command
  avatar: {
    title: (name) => `🖼️ Avatar de ${name}:`,
  },

  // Blacklist command
  blacklist: {
    empty: 'Il n\'y a aucun numéro dans la liste noire.',
    list: '⛔ Liste noire pour la ligne:',
    missing: 'Vous devez fournir un numéro de téléphone.',
    format: 'Le format du numéro fourni est invalide.',
    add: {
      added: (number) => `Le numéro \`${number}\` a été placé sous liste noire avec succès.`,
      already: (number) => `Le numéro \`${number}\` est déjà sous liste noire.`,
      error: 'Une erreur est survenue lors du placement sous liste noire.',
    },
    remove: {
      removed: (number) => `Le numéro \`${number}\` a été retiré de la liste noire avec succès.`,
      unknown: (number) => `Le numéro \`${number}\` n'est pas dans la liste noire.`,
      error: 'Une erreur est survenue lors de l\'extraction de la liste noire.',
    },
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

  // Donators command
  donators: {
    title: '💵 Donations for **Homer**:',
    message: [
      'Homer is a bot developed and maintained pro bono. His hosting costs money and unfortunately there is no magic money. Although I can easily rent a machine for Homer, the money collected from donations could be used for subscriptions to external APIs to embellish the bot with new features.',
      '',
      'If you would like to make a donation, please join the support server and contact a developer (listed in h:about). Thank you a lot!',
    ].join('\n'),
    list: 'Donators',
    perks: 'Perks',
    perkList: [
      'Higher audio quality (from 56 to 128kbps)',
      'Cool badge on user and lookup commands',
    ],
  },

  // Formats command
  formats: {
    title: '📆 Date and time formats:',
    fdate: 'Date format',
    ftime: 'Time format',
    documentation: 'Documentation',
    hint: 'Change date format with `h:formats date` and time format with `h:formats time`.',
    missing: 'You must provide a format to set.',
    length: (max) => `Format length must not exceed **${max}** characters.`,
    error: 'An error occured while setting format.',
    date: {
      set: (now) => `Date format successfully set! Preview: **${now}**`,
    },
    time: {
      set: (now) => `Time format successfully set! Preview: **${now}**`,
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
    noActive: '☎️ You\'re not on a phone call..',
    error: 'An error occurred while hanging up.',
  },

  // Invite
  invite: {
    invite: (emote, url) => `${emote} Invite Homer into your server by following this link: <${url}>.`,
  },

  // Language command
  language: {
    title: '🗣️ Available languages on Homer:',
    footer: 'To change your language, run h:language <code>',
    set: 'I will now speak in English!',
    error: 'An error occured while setting language.',
    unknown: (locale) => `Invalid language code \`${locale}\`.`,
    revision: 'Last revision',
  },

  // Leave command
  leave: {
    none: 'There are no active voice connections.',
    success: (name) => `Successfully left **${name}**.`,
    error: 'An error occured while leaving voice channel.',
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
    gift: {
      title: (code) => `🎁 Information about gift code **${code}**:`,
      name: 'Product',
      summary: 'Summary',
      uses: 'Uses',
      redeem: 'Redeem link',
      expires: 'This gift will expire on',
      status: {
        redeemed: 'Redeemed',
        available: 'Available',
      },
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
      active: 'Last seen',
      creation: 'Creation date',
    },
  },

  // Names command
  names: {
    title: (name) => `✏️ Names history for ${name}:`,
    current: 'Current name',
    until: 'until',
    none: (name) => `No names recorded for ${name}.`,
    footer: 'The accuracy of the data cannot be guaranteed.',
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
    pong: (ws) => `🏓 Pong, **${ws}**ms.`,
  },

  // Prefix command
  prefix: {
    none: 'You must provide a prefix to set (or `disable` to disable).',
    length: (max) => `Prefix length must not exceed **${max}** characters.`,
    set: (prefix) => `Custom prefix set to \`${prefix}\`.`,
    disabled: 'Disabled custom prefix.',
    error: 'An error occured while setting custom prefix.',
  },

  // Radio command
  radio: {
    none: 'Run this command while being on a voice channel or specify a voice channel name.',
    unknown: 'No radio channel set. Use `h:radio <channel>` to set one.',
    set: (name) => `Radio channel is set to **${name}**.`,
    error: 'An error occured while setting radio channel.',
  },

  // Radios command
  radios: {
    empty: 'There are no available radios at the moment.',
    list: '📻 Radios available on **Homer**:',
    footer: (p, t) => `Tune into a station by running h:tune <frequency> | Page ${p}/${t}`,
    pty: {
      // Based on the European PTY codes
      0: 'No programme type',
      1: 'News',
      2: 'Current affairs',
      3: 'Information',
      4: 'Sport',
      5: 'Education',
      6: 'Drama',
      7: 'Culture',
      8: 'Science',
      9: 'Varied',
      10: 'Pop music',
      11: 'Rock music',
      12: 'Easy listening',
      13: 'Light classical',
      14: 'Serious classical',
      15: 'Other music',
      16: 'Weather',
      17: 'Finance',
      18: 'Children\'s programmes',
      19: 'Social affairs',
      20: 'Religion',
      21: 'Phone-in',
      22: 'Travel',
      23: 'Leisure',
      24: 'Jazz music',
      25: 'Country music',
      26: 'National music',
      27: 'Oldies music',
      28: 'Folk music',
      29: 'Documentary',
      30: 'Alarm test',
      31: 'Alarm',
    },
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

  // Tag command
  tag: {
    missing: 'You must provide a tag name.',
    content: 'You must provide a content for your tag.',
    unknown: (name) => `No tags found matching \`${name}\`.`,
    exists: (name) => `Tag \`${name}\` already exists.`,
    owner: (name, { user, id }) => `🏷️ Tag \`${name}\` belongs to ${user} (${id}).`,
    permissions: (name) => `You are not owner of tag \`${name}\`.`,
    error: 'An error occured during tag processing. Please check syntax and its ability to end.',
    api: (message) => `An API error occured when sending processed tag, this is probably due to an invalid embed.\n\`\`\`${message}\`\`\``,
    create: {
      nlength: (max) => `Name length must not exceed **${max}** characters.`,
      length: (max) => `Content length must not exceed **${max}** characters.`,
      created: (name) => `Tag \`${name}\` created successfully.`,
      error: 'An error occured while creating your tag.',
    },
    edit: {
      cannot: (name) => `You can't edit tag \`${name}\`.`,
      length: (max) => `New content length must not exceed **${max}** characters.`,
      edited: (name) => `Tag \`${name}\` edited successfully.`,
      error: 'An error occured while editing your tag.',
    },
    delete: {
      cannot: (name) => `You can't delete tag \`${name}\`.`,
      deleted: (name) => `Tag \`${name}\` deleted successfully.`,
      error: 'An error occured while deleting your tag.',
    },
    list: {
      none: (user) => `${user} does not own any tags.`,
      title: (user, list) => `🏷️ Tags owned by ${user}:\n${list}`,
    },
    private: {
      activated: (name) => `Tag \`${name}\` made public successfully.`,
      deactivated: (name) => `Tag \`${name}\` made private successfully.`,
      error: 'An error occured while activating or deactivating your tag.',
    },
    source: {
      public: (name) => `Source of tag \`${name}\` is now public.`,
      private: (name) => `Source of tag \`${name}\` is now private.`,
      error: 'An error occured while publishing or unpublishing your tag\'s source.',
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
      missed: {
        caller: (number) => `📞 No answer from \`${number}\`.`,
        called: (number) => `📞 Missed call from \`${number}\`.`,
      },
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

  // Timezone command
  timezone: {
    none: 'You must provide a timezone to set.',
    length: (max) => `Timezone length must not exceed **${max}** characters.`,
    invalid: (timezone) => `Unrecognized timezone: \`${timezone}\`.`,
    set: (timezone, now) => `Timezone set to \`${timezone}\`. Current date: ${now}.`,
    error: 'An error occured while setting timezone.',
    list: {
      title: '🌐 Available timezones:',
      footer: 'Set a timezone using h:timezone <zone>',
    },
  },

  // Tune command
  tune: {
    error: 'An error occured while broadcasting radio.',
    missing: 'You must provide a frequency to set.',
    invalid: 'The frequency you provided is invalid.',
    unknown: (freq) => `No radio found on frequency \`${freq}Mhz\`.\n${dot} Find available radios on \`h:radios\`.`,
    tuning: (freq) => `Tuning into \`${freq}Mhz\`...`,
    playing: (radio) => `📻 Listening to **${radio}**`,
  },

  // User command
  user: {
    title: (emote, name) => `${emote} Information about ${name}:`,
    id: 'Discord ID',
    nickname: 'Nickname',
    status: 'Status',
    activity: 'Activity',
    roles: 'Roles',
    active: 'Last seen',
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

  // Weather command
  weather: {
    missing: 'You must provide a city to look for.',
    none: (search) => `No cities have been found matching \`${search}\`.`,
    multiple: (search) => `Several cities have been found matching \`${search}\`:`,
    error: 'An error occured while fetching data.',
    title: (city, state, country) => `🌥️ Weather for **${city}** (${state}, ${country}):`,
    footer: 'The information is provided by Accuweather.',
    now: 'Currently',
    today: 'Today',
    condition: 'Weather',
    temperature: 'Temperature',
    feel: 'Feels like',
    wind: 'Wind',
    uv: 'UV Index',
    humidity: 'Humidity',
    pressure: 'Pressure',
    nebulosity: 'Nebulosity',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    moon: 'Moon',
    format: {
      day: 'dddd MMMM Do',
      time: 'HH:mmA',
      temperature: ([c, f]) => `**${c}**°C (**${f}**°F)`,
      temperatures: ({ max, min }) => `from **${min[0]}**°C (**${min[1]}**°F) to **${max[0]}**°C (**${max[1]}**°F)`,
      feel: ([c, f]) => `**${c}**°C (**${f}**°F)`,
      wind: ({ direction, speed }, gust) => `**${direction}** - **${speed[0]}**kph (**${speed[1]}**mph) - Gusts of **${gust[0]}**kph (**${gust[1]}**mph)`,
      uv: ({ index, text }) => `**${index}** (**${text}**)`,
      humidity: (hr) => `**${hr}**%`,
      pressure: (pr) => `**${pr}**mb`,
      nebulosity: (cover) => `**${cover}**%`,
      moon: (emote, phase) => `${emote} **${phase}**`,
    },
    moons: {
      New: 'New moon',
      WaxingCrescent: 'Waxing crescent',
      FirstQuarter: 'First quarter',
      WaxingGibbous: 'Waxing gibbous',
      Full: 'Full moon',
      WaningGibbous: 'Waning gibbous',
      LastQuarter: 'Last quarter',
      WaningCrescent: 'Waning crescent',
    },
  },
});
