// Homer - Constants file
// Contains some essential data & default settings in order to make Homer working

exports.defaultGuildSettings = id => ({
  id,
  welcome: {
    channel: '0',
    message: false,
  },
  leave: {
    channel: '0',
    message: false,
  },
  ignored: [],
  prefixes: [],
  rolemeRoles: [],
  importedTags: [],
  tagOverrides: [],
  radio: {
    channel: '0',
    volume: 0.5,
  },
  misc: {
    timezone: 'UTC',
    locale: 'en-gb',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    dateTimeLink: true,
  },
});

exports.defaultUserSettings = id => ({
  id,
  prefixes: [],
  importedTags: [],
  tagOverrides: [],
  misc: {
    antighost: false,
    timezone: 'UTC',
    locale: 'en-gb',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    dateTimeLink: true,
  },
});

exports.emotes = {
  // Status
  success: '<:success:453889194016899074>',
  warning: '<:warn:453591316027408395>',
  error: '<:error:453889225356738560>',
  successID: 'success:453889194016899074',
  warningID: 'warn:453591316027408395',
  errorID: 'error:453889225356738560',
  loading: '<a:loading:455113752984027163>',

  // Design
  dot: '▫',
  bot: '<:bot:420699407344730122>',
  homer: '<:homer:474150825929998337>',

  // Services
  rss: '<:rss:529596823275307019>',
  translate: '<:translate:420659720727298054>',

  // Discord badges
  verified: '<:verified:452764762699464724>',
  partner: '<:partner:580730423785816064>',
};

exports.tierEmotes = {
  1: '<:boost_tier1:581519569227874305>',
  2: '<:boost_tier2:581519568363716618>',
  3: '<:boost_tier3:581519568502259742>',
  4: '<:boost_tier4:581519568594534425>',
}

exports.historyIcons = {
  INCOMING_SINGLE: '<:incomingcall:551099247945056256>',
  INCOMING_GROUP: '<:groupcall:551099330421981184>',
  OUTGOING_SINGLE: '<:outgoingcall:551099361367687168>',
  OUTGOING_GROUP: '<:groupcall:551099330421981184>',
  TEXT_SENT: '<:text:551099299786784778>',
  TEXT_RECEIVED: '<:text:551099299786784778>',
};

exports.badges = {
  owner: '<:owner:471599105957953537>',
  donator: '<:donator:471599103126536202>',
  vip: '<:vip:471599120830955530>',
  nitro: '<:nitro:452417495341727763>',
};

exports.status = {
  online: '<:online:470860030116233217>',
  idle: '<:idle:470860043940790272>',
  dnd: '<:dnd:470860101545230337>',
  offline: '<:offline:470860118821699584>',
  streaming: '<:streaming:470860133656690701>',
};

exports.regionFlags = {
  amsterdam: ':flag_nl:',
  brazil: ':flag_br:',
  europe: ':flag_eu:',
  'eu-central': ':flag_eu:',
  'eu-west': ':flag_eu:',
  frankfurt: ':flag_de:',
  hongkong: ':flag_hk:',
  india: ':flag_in:',
  japan: ':flag_jp:',
  london: ':flag_gb:',
  russia: ':flag_ru:',
  'us-central': ':flag_us:',
  'us-east': ':flag_us:',
  'us-south': ':flag_us:',
  'us-west': ':flag_us:',
  singapore: ':flag_sg:',
  southafrica: ':flag_za:',
  sydney: ':flag_au:',
};

exports.vigilances = {
  meteofrance: '<:meteofrance:509791330210414603>',

  // Avalanches
  avalanche_vert: '<:avalanche_vert:509790410059808769>',
  avalanche_jaune: '<:avalanche_jaune:509789649384898570>',
  avalanche_orange: '<:avalanche_orange:509789649007411212>',
  avalanche_rouge: '<:avalanche_rouge:509789648902684704>',

  // Canicule
  chaud_vert: '<:chaud_vert:509790409841573919>',
  chaud_jaune: '<:chaud_jaune:509789649506664458>',
  chaud_orange: '<:chaud_orange:509789649435361281>',
  chaud_rouge: '<:chaud_rouge:509789649565122571>',

  // Crue (affiché "Inondation")
  crue_vert: '<:crue_vert:509790410160472093>',
  crue_jaune: '<:crue_jaune:509789649854791683>',
  crue_orange: '<:crue_orange:509789649577836571>',
  crue_rouge: '<:crue_rouge:509789649674436648>',

  // Grand froid
  froid_vert: '<:froid_vert:509790410210803712>',
  froid_jaune: '<:froid_jaune:509789649930027022>',
  froid_orange: '<:froid_orange:509789649695408128>',
  froid_rouge: '<:froid_rouge:509789649372446721>',

  // Neige-verglas
  neige_vert: '<:neige_vert:509790410261004289>',
  neige_jaune: '<:neige_jaune:509789650135678986>',
  neige_orange: '<:neige_orange:509789649884151813>',
  neige_rouge: '<:neige_rouge:509789649829625867>',
  
  // Orages
  orage_vert: '<:orage_vert:509790410022060036>',
  orage_jaune: '<:orage_jaune:509789650227822594>',
  orage_orange: '<:orage_orange:509789650064375829>',
  orage_rouge: '<:orage_rouge:509789650156781578>',

  // Pluie-Inondation
  inondation_vert: '<:pluie_vert:509790410059546625>',
  inondation_jaune: '<:pluie_jaune:509789650043535360>',
  inondation_orange: '<:pluie_orange:509789649900797977>',
  inondation_rouge: '<:pluie_rouge:509789649934483476>',

  // Vagues-submersion
  vague_vert: '<:vague_vert:509790410391027737>',
  vague_jaune: '<:vague_jaune:509789650467029007>',
  vague_orange: '<:vague_orange:509789650135678977>',
  vague_rouge: '<:vague_rouge:509789650429411358>',

  // Vent violent
  vent_vert: '<:vent_vert:509790410340696065>',
  vent_jaune: '<:vent_jaune:509789650668224512>',
  vent_orange: '<:vent_orange:509789650420760577>',
  vent_rouge: '<:vent_rouge:509789650471223297>',
};

exports.categoryEmotes = {
  bot: '<:homer:474150825929998337>',
  general: '🖥',
  misc: '🎮',
  settings: '🔧',
  telephone: '📞',
};

exports.categoryColors = {
  bot: 0xFFFF00,
  general: 'BLUE',
  misc: 'ORANGE',
  settings: 'GREY',
  telephone: 'RED',
};

exports.profileFields = [
  { id: 'about', name: 'About me' },
  { id: 'email', name: 'E-mail' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'minecraft', name: 'Minecraft' },
  { id: 'nnid', name: 'Nintendo Network ID' },
  { id: 'skype', name: 'Skype' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'steam', name: 'Steam' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'youtube', name: 'YouTube' },
];

exports.languages = {
  'auto': 'Automatic',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'am': 'Amharic',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'ny': 'Chichewa',
  'zh-cn': 'Chinese Simplified',
  'zh-tw': 'Chinese Traditional',
  'co': 'Corsican',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English',
  'eo': 'Esperanto',
  'et': 'Estonian',
  'tl': 'Filipino',
  'fi': 'Finnish',
  'fr': 'French',
  'fy': 'Frisian',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'German',
  'el': 'Greek',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'iw': 'Hebrew',
  'hi': 'Hindi',
  'hmn': 'Hmong',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'ig': 'Igbo',
  'id': 'Indonesian',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'jw': 'Javanese',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'ko': 'Korean',
  'ku': 'Kurdish (Kurmanji)',
  'ky': 'Kyrgyz',
  'lo': 'Lao',
  'la': 'Latin',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mg': 'Malagasy',
  'ms': 'Malay',
  'ml': 'Malayalam',
  'mt': 'Maltese',
  'mi': 'Maori',
  'mr': 'Marathi',
  'mn': 'Mongolian',
  'my': 'Myanmar (Burmese)',
  'ne': 'Nepali',
  'no': 'Norwegian',
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ma': 'Punjabi',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sm': 'Samoan',
  'gd': 'Scots Gaelic',
  'sr': 'Serbian',
  'st': 'Sesotho',
  'sn': 'Shona',
  'sd': 'Sindhi',
  'si': 'Sinhala',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'so': 'Somali',
  'es': 'Spanish',
  'su': 'Sundanese',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'tg': 'Tajik',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'cy': 'Welsh',
  'xh': 'Xhosa',
  'yi': 'Yiddish',
  'yo': 'Yoruba',
  'zu': 'Zulu',
};

exports.deprecatedPermissions = [
  'READ_MESSAGES',
  'EXTERNAL_EMOJIS',
  'MANAGE_ROLES_OR_PERMISSIONS',
];

exports.userAgent = () => `DiscordBot (https://github.com/iDroid27210/homer) Node.js/${process.version}`;
exports.donationLink = id => `https://donatebot.io/checkout/382951433378594817?buyer=${id}`;
exports.CDN = `https://raw.githubusercontent.com/iDroid27/homer_cdn/master`;
exports.githubLink = 'https://github.com/iDroid27/homer';
