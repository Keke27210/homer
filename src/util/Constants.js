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

exports.userAgent = () => `DiscordBot (https://github.com/iDroid27210/homer) Node.js/${process.version}`;

exports.CDN = `https://raw.githubusercontent.com/iDroid27/homer_cdn/master`;

exports.emotes = {
  // Information emotes
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
  verifiedServer: '<:verified:452764762699464724>',
};

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
  'eu-central': ':flag_eu:',
  'eu-west': ':flag_eu:',
  frankfurt: ':flag_de:',
  hongkong: ':flag_hk:',
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
  avalanche_rouge: '<:avalanche_rouge:509789648902684704>',
  avalanche_orange: '<:avalanche_orange:509789649007411212>',
  froid_rouge: '<:froid_rouge:509789649372446721>',
  avalanche_jaune: '<:avalanche_jaune:509789649384898570>',
  chaud_orange: '<:chaud_orange:509789649435361281>',
  chaud_jaune: '<:chaud_jaune:509789649506664458>',
  chaud_rouge: '<:chaud_rouge:509789649565122571>',
  crue_orange: '<:inondation_orange:509789649577836571>',
  crue_rouge: '<:inondation_rouge:509789649674436648>',
  froid_orange: '<:froid_orange:509789649695408128>',
  neige_rouge: '<:neige_rouge:509789649829625867>',
  crue_jaune: '<:inondation_jaune:509789649854791683>',
  neige_orange: '<:neige_orange:509789649884151813>',
  inondation_orange: '<:pluie_orange:509789649900797977>',
  froid_jaune: '<:froid_jaune:509789649930027022>',
  inondation_rouge: '<:pluie_rouge:509789649934483476>',
  inondation_jaune: '<:pluie_jaune:509789650043535360>',
  orage_orange: '<:orage_orange:509789650064375829>',
  vague_orange: '<:vague_orange:509789650135678977>',
  neige_jaune: '<:neige_jaune:509789650135678986>',
  orage_rouge: '<:orage_rouge:509789650156781578>',
  orage_jaune: '<:orage_jaune:509789650227822594>',
  vent_orange: '<:vent_orange:509789650420760577>',
  vague_rouge: '<:vague_rouge:509789650429411358>',
  vague_jaune: '<:vague_jaune:509789650467029007>',
  vent_rouge: '<:vent_rouge:509789650471223297>',
  vent_jaune: '<:vent_jaune:509789650668224512>',
  chaud_vert: '<:chaud_vert:509790409841573919>',
  orage_vert: '<:orage_vert:509790410022060036>',
  inondation_vert: '<:inondation_vert:509790410059546625>',
  avalanche_vert: '<:avalanche_vert:509790410059808769>',
  crue_vert: '<:crue_vert:509790410160472093>',
  froid_vert: '<:froid_vert:509790410210803712>',
  neige_vert: '<:neige_vert:509790410261004289>',
  vent_vert: '<:vent_vert:509790410340696065>',
  vague_vert: '<:vague_vert:509790410391027737>',
  meteofrance: '<:meteofrance:509791330210414603>',
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

exports.deprecatedPermissions = [
  'READ_MESSAGES',
  'EXTERNAL_EMOJIS',
  'MANAGE_ROLES_OR_PERMISSIONS',
];

exports.suggestionsChannel = '535539166637850631';
exports.reportsChannel = '535787193159909376';
exports.donationLink = id => `https://donatebot.io/checkout/382951433378594817?buyer=${id}`;
exports.githubLink = 'https://github.com/iDroid27/homer';
