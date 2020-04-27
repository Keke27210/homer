module.exports = (dot) => ({
  /* LOCALE INFORMATION */
  _: {
    code: 'fr-fr',
    name: 'Français (France)',
    revision: 1587466213850,
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
    more: (num) => `et **${num}** encore...`,
    cooldown: 'On se calme !',
  },

  database: {
    notReady: 'Cette fonctionnalité repose sur la base de données qui est momentanément indisponible. Veuillez nous excuser pour la gêne occasionnée.',
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
      more: 'Plus',
    },

    // Help command
    main: '📚 Aide d\'**Homer**:',
    footer: 'Ajoutez "help" à la fin d\'une commande pour obtenir plus d\'aide.',
    cannot: 'Impossible de vous envoyer l\'aide ! Vérifiez que vous acceptez mes messages privés.',
    more: (invite) => `Si vous avez des questions sur une fonctionnalité ou rencontrez un problème que vous n'arrivez pas à régler, rejoignez notre **[serveur de support](${invite})** où vous serez rapidement aidé !\nVous pouvez également faire une donation pour soutenir le développement d'Homer et accéder à des contre-parties cool !`,

    // Help for a specific command
    sub: (name) => `📚 Aide pour \`${name}\`:`,
    aliases: 'Aliases',
    usage: 'Utilisation',
    example: 'Exemple',
    subcommands: 'Sous-commandes',

    // Help for commands
    about: {
      description: 'Information about the bot',
      usage: null,
      example: null,
    },
    activities: {
      description: 'Displays user activities',
      usage: '[user]',
      example: 'Luke',
    },
    avatar: {
      description: 'Displays a member\'s avatar',
      usage: '[member]',
      example: '@Luke',
    },
    blacklist: {
      description: 'Manages a contract\'s blacklist',
      usage: null,
      example: null,

      add: {
        description: 'Blacklists a number',
        usage: '<number>',
        example: 'SUPPORT',
      },
      remove: {
        description: 'Removes a number from the blacklist',
        usage: '<number>',
        example: 'SUPPORT',
      },
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
    donators: {
      description: 'Information about donators and donation process',
      usage: null,
      example: null,
    },
    equalizer: {
      description: 'Configures radio equalizer (not available yet)',
      usage: '<band> <gain>',
      example: '2 4',
    },
    eval: {
      description: 'Evaluates Javascript code',
      usage: '[code]',
      example: 'this.client.token',
    },
    formats: {
      description: 'Displays current date and time formats',
      usage: null,
      example: null,

      date: {
        description: 'Sets the date format',
        usage: '<format>',
        example: 'MM/DD/YYYY',
      },
      time: {
        description: 'Sets the time format',
        usage: '<format>',
        example: 'HH hours mm minutes ss seconds',
      },
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
    help: {
      description: 'Shows this menu',
      usage: null,
      example: null,
    },
    invite: {
      description: 'Shows the link to invite Homer into your server',
      usage: null,
      example: null,
    },
    language: {
      description: 'Displays available languages on Homer',
      usage: null,
      example: null,
    },
    leave: {
      description: 'Leaves voice channel Homer is on',
      usage: null,
      example: null,
    },
    lookup: {
      description: 'Displays information on a Discord entity (user/guild/invite/gift)',
      usage: '<id/invite/gift code>',
      example: '205427654042583040',
    },
    names: {
      description: 'Shows someone\'s previous names',
      usage: '[user]',
      example: '@You',
    },
    now: {
      description: 'Displays information about playing radio',
      usage: null,
      example: null,
    },
    ping: {
      description: 'Pong!',
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
    prefix: {
      description: 'Sets a custom prefix',
      usage: '<prefix|disable>',
      example: '/',
    },
    quote: {
      description: 'Quotes a message',
      usage: '<message id> [channel]',
      example: '703352314445955082 #staff',
    },
    radio: {
      description: 'Sets the radio channel',
      usage: '[channel]',
      example: 'Music',
    },
    radios: {
      description: 'Lists all available radios',
      usage: null,
      example: null,
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
    servicetel: {
      description: 'Displays information about a contract',
      usage: '<contract no.>',
      example: '0',
    },
    shutdown: {
      description: 'Gracefully shuts down the bot',
      usage: '[exit code]',
      example: '4',
    },
    tag: {
      description: 'Executes a tag using Lisa\'s scripting language',
      usage: '<name>',
      example: 'discord.js',

      create: {
        description: 'Creates a tag',
        usage: '<name> <content>',
        example: 'discord.js What a powerful library!',
      },
      edit: {
        description: 'Edits a tag',
        usage: '<name> <content>',
        example: 'discord.js No actually it\'s the best one',
      },
      delete: {
        description: 'Deletes a tag',
        usage: '<name>',
        example: 'discord.js',
      },
      list: {
        description: 'Lists all tags owned by a user',
        usage: '[user]',
        example: '@b1nZy',
      },
      owner: {
        description: 'Displays a tag owner',
        usage: '<name>',
        example: 'discord.js',
      },
      raw: {
        description: 'Displays a tag content without processing',
        usage: '<name>',
        example: 'discord.js',
      },
      raw2: {
        description: 'Displays a tag content in code blocks',
        usage: '<name>',
        example: 'discord.js',
      },
      private: {
        description: 'Makes a tag private or public',
        usage: '<name>',
        example: 'discord.js',
      },
      source: {
        description: 'Makes a tag\'s source private or public',
        usage: '<name>',
        example: 'discord.js',
      },
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
      toggle: {
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
    timezone: {
      description: 'Sets the timezone',
      usage: '<timezone>',
      example: 'Europe/Paris',

      list: {
        description: 'Displays available zones',
        usage: null,
        example: null,
      },
    },
    tune: {
      description: 'Tunes into a station',
      usage: '<frequency>',
      example: '98.8',
    },
    user: {
      description: 'Displays information about a user',
      usage: '[user]',
      example: '@Homer',
    },
    volume: {
      description: 'Sets radio volume (in percentage)',
      usage: '<volume>',
      example: '75',
    },
    weather: {
      description: 'Gets weather for the provided city',
      usage: '<city>',
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
    error: 'Une erreur est survenue lors de l\'exécution de la commande. Réessayez ou rejoignez le serveur de support.',
    noDm: 'Cette commande ne peut pas être exécutée en messages privés.',
    override: 'Une règle présente dans le sujet du salon empêche l\'exécution de la commande.',
    userPermissions: (permissions) => `Vous avez besoin des permissions suivantes pour exécuter cette commande: ${permissions}.`,
    botPermissions: (permissions) => `J'ai besoin des permissions suivantes pour exécuter cette commande: ${permissions}.`,
  },

  /* COMMANDS */
  // About command
  about: {
    title: (emote, name) => `${emote} Informations sur **${name}**:`,
    developers: 'Développeurs',
    guilds: 'Serveurs',
    shard: (id) => `vous êtes sur la shard \`#${id}\``,
    memory: 'Utilisation RAM',
    versions: 'Versions',
    links: 'Liens',
  },

  // Activities command
  activities: {
    title: (emote, user) => `${emote} Activités de ${user}:`,
    none: (emote, name) => `${emote} ${name} ne fait rien en ce moment.`,
    elapsed: (time) => `A débuté **${time}**`,
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
    empty: 'Il n\'y a aucune entrée dans la liste noire.',
    list: '⛔ Liste noire de la ligne:',
    missing: 'Vous devez fournir un numéro de téléphone.',
    format: 'Le format du numéro de téléphone fourni n\'est pas valide.',
    add: {
      added: (number) => `Le numéro \`${number}\` a été placé sur liste noire avec succès.`,
      already: (number) => `Le numéro \`${number}\` est déjà sur liste noire.`,
      error: 'Une erreur est survenue lors du placement sur liste noire.',
    },
    remove: {
      removed: (number) => `Le numéro \`${number}\` a été retiré de la liste noire avec succès.`,
      unknown: (number) => `Le numéro \`${number}\` n'est pas dans la liste noire.`,
      error: 'Une erreur est survenue lors du retrait de la liste noire.',
    },
  },

  // Channel command
  channel: {
    title: (emote, name, type) => `${emote} Informations sur **${type === 'text' ? '#' : ''}${name}**:`,
    id: 'Discord ID',
    type: 'Type',
    position: 'Position',
    users: 'Membres',
    slowdown: 'Mode lent',
    bitrate: 'Taux d\'échantillonage',
    creation: 'Date de création',
    topic: 'Sujet',
    types: {
      category: 'Catégorie',
      text: 'Texte',
      voice: 'Voix',
      news: 'Annonce',
      store: 'Boutique',
    },
  },

  // Dial command
  dial: {
    noNumber: 'Vous devez fournir un numéro à appeler.',
    unknown: 'Le numéro que vous avez composé n\'est pas attribué.',
    busy: 'La ligne est occupée.',
    correspondentBusy: 'La ligne de votre correspondant semble occupée.',
    error: 'Une erreur est survenue lors de la numérotation.',
  },

  // Donators command
  donators: {
    title: '💵 Donations pour **Homer**:',
    message: [
      'Homer est un bot développé et maintenu bénévolement. Son hébergement coûte de l\'argent et malheureusement il n\'y a pas d\'argent magique. Bien que je peux facilement louer une machine pour Homer, l\'argent collecté des donations pourrait être utilisé pour des abonnements à des APIs externes pour embellir le bot avec de nouvelles fonctionnalités.',
      '',
      'Si vous souhaitez faire une donation, veuillez rejoindre le serveur de support et contacter un développeur (dans `h:about`). Merci beaucoup !',
    ].join('\n'),
    list: 'Donateurs',
    perks: 'Contre-parties',
    perkList: [
      'Égaliseur sonore (bientôt)',
      'Badge cool sur les commandes `user` et `lookup`',
    ],
  },

  // Formats command
  formats: {
    title: '📆 Formats d\'heure et de date:',
    fdate: 'Format de date',
    ftime: 'Formatd d\'heure',
    documentation: 'Documentation',
    hint: 'Changez le format de date avec `h:formats date` et celui d\'heure avec `h:formats time`.',
    missing: 'Vous devez fournir un format à définir.',
    length: (max) => `La longueur du format ne doit excéder **${max}** caractères.`,
    error: 'Une erreur est survenue lors de l\'édition du format.',
    date: {
      set: (now) => `Format de date mis à jour ! Exemple: **${now}**`,
    },
    time: {
      set: (now) => `Format d'heure mis à jour ! Exemple: **${now}**`,
    },
  },

  // Google command
  google: {
    noSearch: 'Vous devez fournir quelque chose à rechercher.',
    unavailable: 'La recherche Google est temporairement indisponible. Nous nous en excusons.',
    searching: 'Recherche...',
    noResults: (search) => `Aucun résultat de recherche pour \`${search}\`.`,
    error: 'Une erreur est survenue lors de la recherche. Nous nous en excusons.',
  },

  // Hangup command
  hangup: {
    noActive: '☎️ Vous n\'êtes pas en cours d\'appel..',
    error: 'Une erreur est survenue lors du raccrochage.',
  },

  // Invite
  invite: {
    invite: (emote, url) => `${emote} Invitez Homer sur votre serveur avec le lien suivant: <${url}>.`,
  },

  // Language command
  language: {
    title: '🗣️ Langues disponibles sur Homer:',
    footer: 'Pour changer de langue, exécutez h:language <code>',
    set: 'Je parlerais maintenant en français !',
    error: 'Une erreur est survenue lors du changement de la langue.',
    unknown: (locale) => `Langue invalide: \`${locale}\`.`,
    revision: 'Dernière révision',
  },

  // Leave command
  leave: {
    none: 'Il n\'y a aucune connexion active.',
    success: (name) => `**${name}** quitté avec succès.`,
    error: 'Une erreur est survenue.',
  },

  // Lookup command
  lookup: {
    noSearch: 'Vous devez fournir quelque chose à rechercher.',
    looking: 'Recherche en cours...',
    noResults: (search) => `Aucune entité Discord trouvée correspondant à \`${search}\`.`,
    invite: {
      title: (code) => `📧 Informations sur l'invitation **${code}**:`,
      inviter: 'Inviteur',
      channel: 'Salon',
      members: 'Membres',
      guild: {
        title: 'Informations sur le serveur',
        server: 'Nom',
        creation: 'Date de création',
      },
      memberDesc: (total, online, emote) => `**${total}** dont ${emote} **${online}**`,
    },
    gift: {
      title: (code) => `🎁 Informations sur le code cadeau **${code}**:`,
      name: 'Produit',
      summary: 'Description',
      uses: 'Utilisations',
      redeem: 'Lien de réclamation',
      expires: 'Ce cadeau expira',
      status: {
        redeemed: 'Réclamé',
        available: 'Disponible',
      },
    },
    server: {
      widgetDisabled: (id) => `Serveur existant avec l'ID \`${id}\` mais aucune information supplémentaire disponible.`,
      title: (name) => `🖥️ Informations sur le serveur **${name}**:`,
      id: 'Discord ID',
      members: 'Membres',
      channels: 'Salons',
      invite: 'Invitation',
      creation: 'Date de création',
    },
    template: {
      title: (emote, code) => `${emote} Informations sur le modèle **${code}**:`,
      name: 'Nom',
      description: 'Description',
      creator: 'Créateur',
      usages: 'Nombre d\'utilisations',
      creation: 'Date de création',
      use: 'Utilisation',
      uselink: 'Appliquer ce modèle',
      update: 'Dernière mise à jour',
    },
    user: {
      title: (emote, name) => `${emote} Informations sur ${name}:`,
      id: 'Discord ID',
      active: 'Dernière activité',
      creation: 'Date de création',
    },
  },

  // Names command
  names: {
    title: (name) => `✏️ Historique des noms pour ${name}:`,
    current: 'Nom actuel',
    until: 'jusqu\'au',
    none: (name) => `Aucun ancien nom trouvé pour ${name}.`,
    footer: 'La fiabilité des données ne peut être garantie.',
  },

  // Now command
  now: {
    title: '📻 Informations sur la radio en cours de diffusion:',
    playing: 'Diffuse',
    noInformation: 'Aucune info',
    begun: 'Débuté',
    noSession: 'Vous devez écouter une radio.',
    footer: 'Ce message se rafrîchira toutes les 3 secondes pendant 3 minutes.',
  },

  // Phonebook command
  phonebook: {
    title: '🔖 Annuaire téléphonique d\'Homer:',
    empty: 'L\'annuaire est actuellement vide.',
    toggle: {
      visible: 'Vous êtes désormais visible dans l\'annuaire.',
      invisible: 'Vous n\'êtes désormais plus visible dans l\'annuaire.',
      message: 'Vous devez avoir défini une description pour votre ligne.',
      error: 'Une erreur est survenue lors de votre demande d\'apparition dans l\'annuaire.',
    },
    message: {
      set: (message) => `Vous apparaîtrez désormais dans l'annuaire avec le message: \`${message}\`.`,
      length: (max) => `La longueur du message ne doit excéder **${max}** caractères.`,
      missing: 'Vous devez fournir un message à définir.',
      error: 'Une erreur est survenue lors de l\'édition de votre description.',
    },
  },

  // Pickup command
  pickup: {
    noPending: 'Il n\'y a pas d\'appel entrant.',
    asCaller: 'Vous ne pouvez pas décrocher en tant qu\'appelant.',
    error: 'Une erreur est survenue lors du décrochage.',
  },

  // Ping command
  ping: {
    pong: (ws) => `🏓 Pong, **${ws}**ms.`,
  },

  // Prefix command
  prefix: {
    none: 'Vous devez définir un préfixe (ou `disable` pour le désactiver).',
    length: (max) => `La longueur du préfixe ne doit excéder **${max}** caractères.`,
    set: (prefix) => `Le préfixe personnalisé est maintenant \`${prefix}\`.`,
    disabled: 'Le préfixe personnalisé a été désactivé.',
    error: 'Une erreur est survenue lors du réglage du préfixe.',
  },

  // Quote command
  quote: {
    title: (author, channel) => `💬 Citation de ${author} dans **#${channel}**:`,
    edit: (id) => `ID:${id} - Édité`,
    creation: (id) => `ID:${id} - Envoyé`,
    noContent: 'Ce message ne contient aucun contenu affichable.',
    unknown: (id, channel) => `Aucun message trouvé avec l'ID \`${id}\` dans **#${channel}**.`,
  },

  // Radio command
  radio: {
    deprecate: 'Homer\'s radio is now button-based! Run `h:radio [frequency]` to turn it on.',
    header: '📻 Interface radio d\'Homer',
    footer: 'Apprenez à utiliser la radio d\'Homer avec h:radio tutorial.',
    unset: 'Vous devez définir un salon radio avec `h:radio channel`.',
    notin: (name) => `Vous devez être dans le salon radio (**${name}**).`,
    instance: 'You must turn off current\'s radio before creating a new one.',
    permissions: (name) => `Le bot doit pouvoir se connecter et parler dans **${name}**.`,
    error: 'Une erreur est survenue lors de l\'allumage de la radio. Réessayez plus tard.',
    channel: {
      none: 'Exécutez cette commande en spécifiant le nom d\'un salon vocal ou en étant dans un salon.',
      unknown: 'Aucun salon de radio. Utilisez `h:radio <salon>` pour le définir.',
      set: (name) => `La radio sera désormais jouée dans **${name}**.`,
      error: 'Une erreur est survenue lors du réglage du salon.',
    },
    tutorial: {
      title: '📻 Comment utiliser la radio d\'Homer:',
      list: [
        `${dot} Obtenez la liste des radios disponibles sur \`h:radios\`.`,
        `${dot} Branchez-vous directement sur une station avec \`h:radio [fréquence]\`.`,
        `${dot} Changez de fréquence avec les boutons ◀️ et ▶️.`,
        `${dot} Changez le volume avec les boutons 🔉 et 🔊.`,
        `${dot} Arrêtez la radio à tout moment avec le bouton ⏹️.`,
        `${dot} Radio manquante ? Appelez \`SUPPORT\` pour qu'elle soit rajoutée !`,
        `${dot} Vous devrez peut-être attendre un peu avant que le son arrive, ne touchez pas à la fréquence !`,
      ].join('\n'),
    },
  },

  // Radios command
  radios: {
    empty: 'Il n\'y a aucune radio disponible pour le moment.',
    list: '📻 Radios disponibles sur **Homer**:',
    footer: (p, t) => `Écoutez une station avec h:tune <fréquence> | Page ${p}/${t}`,
    pty: {
      // Based on the European PTY codes
      0: 'Aucune information',
      1: 'Actualités',
      2: 'Affaires courantes',
      3: 'Informations',
      4: 'Sport',
      5: 'Éducation',
      6: 'Drame',
      7: 'Culture',
      8: 'Science',
      9: 'Variétés',
      10: 'Musique pop',
      11: 'Musique rock',
      12: 'Musique posée',
      13: 'Classique',
      14: 'Classique',
      15: 'Autres musiques',
      16: 'Météo',
      17: 'Finance',
      18: 'Jeunesse',
      19: 'Affaires sociales',
      20: 'Religion',
      21: 'Auditeurs',
      22: 'Voyage',
      23: 'Leisure',
      24: 'Musique jazz',
      25: 'Musique country',
      26: 'Musiques du pays',
      27: 'Oldies',
      28: 'Folklore',
      29: 'Documentaires',
      30: 'Alarm test',
      31: 'Alarm',
    },
  },

  // Role command
  role: {
    title: (name) => `🎭 Informations sur le rôle **${name}**:`,
    id: 'Discord ID',
    color: 'Couleur',
    position: 'Position',
    memberCount: 'Membres',
    managed: 'Géré',
    mentionable: 'Mentionable',
    hoisted: 'Séparé',
    permissions: 'Permissions',
    creation: 'Date de création',
    members: {
      title: (name) => `🎭 Members dans le rôle **${name}**:`,
      empty: (name) => `Le rôle **${name}** ne compte aucun membre.`,
    },
  },

  // Server command
  server: {
    title: (name, pub) => `🖥️ Informations sur le serveur${pub ? ' public' : ''} **${name}**:`,
    id: 'Discord ID',
    owner: 'Propriétaire',
    region: 'Région',
    boost: 'Boosts',
    members: 'Membres',
    memberDesc: (total, online, bots, eOnline, eBot) => `**${total}** dont **${online}** ${eOnline} et **${bots}** ${eBot}`,
    channels: 'Salons',
    creation: 'Date de création',
    boosts: {
      level: (level) => `Niveau ${level}`,
      count: (count) => `${count} booster${count > 1 ? 's' : ''}`,
    },
    channel: {
      category: 'Catégorie',
      text: 'Texte',
      voice: 'Voix',
    },
    regions: {
      amsterdam: 'Amsterdam',
      brazil: 'Brésil',
      dubai: 'Dubaï',
      europe: 'Europe',
      'eu-central': 'Europe Centrale',
      'eu-east': 'Europe de l\'Est',
      'eu-west': 'Europe de l\'Ouest',
      frankfurt: 'Frankfort',
      hongkong: 'Hong Kong',
      india: 'Inde',
      japan: 'Japon',
      london: 'Londres',
      russia: 'Russie',
      singapore: 'Singapour',
      southafrica: 'Afrique du Sud',
      sydney: 'Sydney',
      'us-central': 'Centre US',
      'us-east': 'Est US',
      'us-south': 'Sud US',
      'us-west': 'Ouest US',
    },
  },

  // Servicetel command
  servicetel: {
    noID: 'Vous devez fournir le numéro d\'un contrat.',
    invalid: 'Le numéro entré n\'est pas un n° de contrat valide.',
    unknown: (id) => `Aucun contrat trouvé avec le n°\`${id}\`.`,
    contract: (type) => `Informations sur le contrat ${type}`,
    title: (id) => `🛃 Informations sur le contrat n°\`${id}\`:`,
    guild: 'Informations sur le serveur hôte',
    subscriber: 'Informations sur le souscripteur',
    blacklist: 'Liste noire',
  },

  // Tag command
  tag: {
    missing: 'Vous devez fournir le nom d\'un tag.',
    content: 'Vous devez fournir un contenu pour votre tag.',
    unknown: (name) => `Aucun tag trouvé correspondant à \`${name}\`.`,
    exists: (name) => `Le tag \`${name}\` existe déjà.`,
    owner: (name, { user, id }) => `🏷️ Le tag \`${name}\` appartient à ${user} (${id}).`,
    permissions: (name) => `Vous n'êtes pas l'auteur du tag \`${name}\`.`,
    error: 'Une erreur est survenue lors du traitement du tag. Vérifiez sa syntaxe et son algorithme.',
    api: (message) => `Une erreur provenant de l'API est survenue, cela est probablement dû à un embed incorrect.\n\`\`\`${message}\`\`\``,
    create: {
      nlength: (max) => `Le nom du tag ne doit excéder **${max}** caractères.`,
      length: (max) => `Le content du tag ne doit excéder **${max}** caractères.`,
      created: (name) => `Le tag \`${name}\` a été créé avec succès.`,
      error: 'Une erreur est survenue lors de la création du tag.',
    },
    edit: {
      cannot: (name) => `Vous ne pouvez pas éditer le tag \`${name}\`.`,
      length: (max) => `Le nouveau contenu du tag ne doit excéder **${max}** caractères.`,
      edited: (name) => `Le tag \`${name}\` a été edité avec succès.`,
      error: 'Une erreur est survenue lors de l\'édition du tag.',
    },
    delete: {
      cannot: (name) => `Vous ne pouvez pas supprimer le tag \`${name}\`.`,
      deleted: (name) => `Le tag \`${name}\` a été supprimé avec succès.`,
      error: 'Une erreur est survenue lors de la suppression du tag.',
    },
    list: {
      none: (user) => `${user} ne possède aucun tag.`,
      title: (user, list) => `🏷️ Tags appartenant à ${user}:\n${list}`,
    },
    private: {
      activated: (name) => `Le tag \`${name}\` a été rendu public avec succès.`,
      deactivated: (name) => `Le tag \`${name}\` a été rendu privé avec succès.`,
      error: 'Une erreur est survenue lors de l\'activation/désactivation du tag.',
    },
    source: {
      public: (name) => `La source du tag \`${name}\` a été rendue publique avec succès.`,
      private: (name) => `Le source du tag \`${name}\` a été rendue privée avec succès.`,
      error: 'Une erreur est survenue lors de la publication/dépublication de la source du tag.',
    },
  },

  // Telephone command
  telephone: {
    welcome: '☎️ Bienvenue sur le téléphone d\'Homer ! Pour commencer, exécutez `h:telephone subscribe`.',
    existing: (id) => `Le contrat n°\`${id}\` est déjà actif sur ce salon.`,
    unknown: '☎️ Aucun contrat présent sur ce salon. Souscrivez avec `h:telephone subscribe`.',
    pending: '☎️ Votre demande d\'abonnement est en cours de traitement... Veuillez patienter.',
    paused: '☎️ Vous devez réactiver votre ligne avant de pouvoir l\'utiliser.',
    contract: {
      title: '☎️ Informations sur ce contrat:',
      id: 'Numéro de contrat',
      number: 'Numéro de ligne',
      subscriber: 'Souscripteur',
      state: 'État',
      textable: 'Autorise SMS',
      date: 'Date de souscription',
      noNumber: 'Non assigné',
    },
    notifications: {
      activated: (number) => `☎️ Votre ligne a été activée, votre numéro de téléphone: \`${number}\`.`,
      invalidated: 'Votre ligne n\'a pas été activée. Rejoignez le serveur de support pour en connaître les raisons.',
      outgoing: (number) => `📞 Appel sortant vers \`${number}\`...`,
      incoming: (number) => `📞 Appel entrant de \`${number}\`. Exécutez \`h:pickup\` pour répondre.`,
      pickedCaller: '📞 Votre correspondant a décroché le téléphone.',
      pickedCalled: '📞 Vous avez décroché le téléphone.',
      terminated: '📞 La communication a pris fin.',
      paused: '☎️ Votre ligne a été désactivée. Réactivez-la à tout moment avec `h:telephone toggle`.',
      resumed: '☎️ Votre ligne a été réactivée.',
      text: (num) => `📧 SMS reçu de \`${num}\`:`,
      missed: {
        caller: (number) => `📞 Aucune réponse de \`${number}\`.`,
        called: (number) => `📞 Appel manqué de \`${number}\`.`,
      },
    },
    states: {
      0: 'En attente d\'activation',
      1: 'Ligne active',
      2: 'Mise en pause',
      3: 'Contrat rompu par le souscripteur',
      4: 'Contrat suspendu',
      5: 'Contrat invalidé',
    },
    subscribe: {
      disclaimer: 'Voulez-vous vraiment demander un abonnement pour ce salon ?',
      eligibility: 'Vérification de votre éligibilité...',
      notEligible: 'Vous n\'êtes pas éligible au téléphone d\'Homer.',
      applied: (id) => `Votre demande d'abonnement a été envoyée. Votre numéro de contrat: \`${id}\`.`,
      error: 'Une erreur est survenue lors de votre demande d\'abonnement.',
      aborted: 'Vous avez annulé votre demande d\'abonnement.',
    },
    terminate: {
      disclaimer: 'Voulez-vous vraiment résilier votre contrat ? Vous êtes limité à deux signatures toutes les deux semaines.',
      done: (id) => `Le contrat n°\`${id}\` a été résilié avec succès.`,
      error: 'Une erreur est survenue lors de l\'annulation de votre contrat.',
      aborted: 'Vous avez annulé votre demande de résiliation.',
    },
    toggle: {
      error: 'Une erreur est survenue lors du traitement de votre demande.',
    },
    hint: {
      text: (num) => `Répondez à ce message avec h:text ${num} <message>`,
    },
  },

  // Text command
  text: {
    missingNumber: 'Vous devez fournir le numéro de votre correspondant.',
    missingContent: 'Vous devez fournir un message à envoyer.',
    contentLength: (max) => `La longueur du message ne doit excéder **${max}** caractères.`,
    unable: (number) => `L'envoi de votre message à \`${number}\` a échoué.`,
    sent: (number) => `Votre message a été envoyé à \`${number}\` avec succès.`,
    error: 'Une erreur est survenue lors de l\'envoi de votre message.',
  },

  // Timezone command
  timezone: {
    none: 'Vous devez fournir un fuseau horaire.',
    length: (max) => `La longueur du fuseau ne doit excéder **${max}** caractères.`,
    invalid: (timezone) => `Fuseau horaire inconnu: \`${timezone}\`.`,
    set: (timezone, now) => `Le fuseau horaire est désormais \`${timezone}\`. Heure actuelle: ${now}.`,
    error: 'Une erreur est survenue lors du réglage du fuseau horaire.',
    list: {
      title: '🌐 Fuseaux horaires disponibles:',
      footer: 'Changez de fuseau horaire avec h:timezone <fuseau>',
    },
  },

  // Tune command
  tune: {
    error: 'Une erreur est survenue lors de la diffusion.',
    none: (channel) => `Vous devez être dans le salon radio (**${channel}**).`,
    missing: 'Vous devez fournir une fréquence à écouter.',
    invalid: 'La fréquence que vous avez fournie est invalide.',
    unknown: (freq) => `Aucune radio trouvée sur la fréquence \`${freq}Mhz\`.\n${dot} Retrouvez les radios disponibles sur \`h:radios\`.`,
    tuning: (freq) => `Recherche du signal sur \`${freq}Mhz\`...`,
    playing: (radio) => `📻 Vous écoutez **${radio}**`,
  },

  // User command
  user: {
    title: (emote, name) => `${emote} Informations sur ${name}:`,
    id: 'Discord ID',
    nickname: 'Pseudo',
    status: 'Status',
    activity: 'Activité',
    roles: 'Rôles',
    active: 'Dernière activité',
    creation: 'Date de création',
    join: 'Date d\'arrivée',
    activities: {
      streaming: (name) => `Diffuse **${name}**`,
      playing: (name) => `Joue à **${name}**`,
      listening: (details, name) => `Écoute **${details}** sur ${name}`,
      watching: (name) => `Regarde **${name}**`,
    },
    statusDesc: {
      online: 'En ligne',
      idle: 'Absent',
      dnd: 'Ne pas déranger',
      offline: 'Hors-ligne',
    },
  },

  // Volume command
  volume: {
    missing: 'Vous devez définir le nouveau volume.',
    number: 'Le volume doit être un nombre.',
    range: 'Le volume doit être compris entre 0 et 100.',
    set: (volume) => `Le volume est maintenant de \`${volume}%\`.`,
    error: 'Une erreur est survenue lors du réglage du volume.',
  },

  // Weather command
  weather: {
    missing: 'Vous devez fournir une ville à rechercher.',
    none: (search) => `Aucune ville trouvée correspondant à \`${search}\`.`,
    multiple: (search) => `Plusieurs villes trouvées correspondant à \`${search}\`:`,
    error: 'Une erreur est survenue lors de la récupération des données météo.',
    title: (city, state, country) => `🌥️ Météo pour **${city}** (${state}, ${country}):`,
    footer: 'Les informations sont fournies par Accuweather.',
    now: 'Actuellement',
    today: 'Aujourd\'hui',
    condition: 'Météo',
    temperature: 'Température',
    feel: 'Ressenti',
    wind: 'Vent',
    uv: 'Index UV',
    humidity: 'Humidité',
    pressure: 'Pression',
    nebulosity: 'Nébulosité',
    sunrise: 'Lever de Soleil',
    sunset: 'Coucher de Soleil',
    moon: 'Lune',
    format: {
      day: 'dddd MMMM Do',
      time: 'HH:mmA',
      temperature: ([c, f]) => `**${c}**°C (**${f}**°F)`,
      temperatures: ({ max, min }) => `de **${min[0]}**°C (**${min[1]}**°F) jusqu'à **${max[0]}**°C (**${max[1]}**°F)`,
      feel: ([c, f]) => `**${c}**°C (**${f}**°F)`,
      wind: ({ direction, speed }, gust) => `**${direction}** - **${speed[0]}**km/h (**${speed[1]}**mph) - Rafales de **${gust[0]}**km/h (**${gust[1]}**mph)`,
      uv: ({ index, text }) => `**${index}** (**${text}**)`,
      humidity: (hr) => `**${hr}**%`,
      pressure: (pr) => `**${pr}**hPa`,
      nebulosity: (cover) => `**${cover}**%`,
      moon: (emote, phase) => `${emote} **${phase}**`,
    },
    moons: {
      New: 'Nouvelle lune',
      WaxingCrescent: 'Premier croissant',
      First: 'Premier quartier',
      WaxingGibbous: 'Gibbeuse croissante',
      Full: 'Pleine lune',
      WaningGibbous: 'Gibbeuse décroissante',
      Last: 'Dernier quartier',
      WaningCrescent: 'Dernier croissant',
    },
  },
});
