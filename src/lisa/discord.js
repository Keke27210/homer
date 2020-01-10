const Method = require('../structures/Method');
const moment = require('moment');
const { RichEmbed } = require('discord.js');
const { deconstruct } = require('../../node_modules/discord.js/src/util/Snowflake');

module.exports = [
  // user
  new Method(
    'user',
    env => env.user.username,
    (env, params) => {
      if (!env.guild) return env.user.username;
      if (!params[0]) return 'NOT_FOUND';
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return members.length > 0 ? members[0].user.username : 'NOT_FOUND';
    },
  ),

  // nick
  new Method(
    'nick',
    (env) => ((env.member && env.member.nickname) ? env.member.nickname : env.user.username),
    (env, params) => {
      if (!env.guild)return ((env.member && env.member.nickname) ? env.member.nickname : env.user.username);
      if (!params[0]) return 'NOT_FOUND';
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return members.length > 0 ? (members[0].nickname || members[0].user.username) : 'NOT_FOUND';
    },
  ),

  new Method(
    'discrim',
    (env) => env.user.discriminator,
    (env, params) => {
      if (!env.guild) return env.user.discriminator;
      if (!params[0]) return 'NOT_FOUND';
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return members.length > 0 ? members[0].user.discriminator : 'NOT_FOUND';
    },
  ),

  // avatar
  new Method(
    'avatar',
    (env) => (env.user.avatar ? `https://cdn.discordapp.com/avatars/${env.user.id}/${env.user.avatar}.png` : this.getDefaultAvatar(env.user.discriminator)),
    (env, params) => {
      if (!env.guild) return (env.user.avatar ? `https://cdn.discordapp.com/avatars/${env.user.id}/${env.user.avatar}.png` : this.getDefaultAvatar(env.user.discriminator));
      if (!params[0]) return 'NOT_FOUND';
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return members.length > 0 ? (members[0].user.avatar ? `https://cdn.discordapp.com/avatars/${members[0].user.id}/${members[0].user.avatar}.png` : this.getDefaultAvatar(members[0].user.discriminator)) : 'NOT_FOUND';
    },
  ),

  // bot
  new Method(
    'bot',
    (env) => (env.user.bot ? 'true' : 'false'),
    (env, params) => {
      if (!env.guild) return env.user.bot ? 'true' : 'false';
      if (!params[0]) return 'NOT_FOUND';
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return (members.length > 0 ? (members[0].user.bot ? '1' : '0') : 'NOT_FOUND');
    },
  ),

  // creation
  new Method(
    'creation',
    null,
    (env, params) => deconstruct(params[0]).timestamp.toString(),
  ),

  // userid
  new Method(
    'userid',
    (env) => env.user.id,
    (env, params) => {
      if (!env.guild) return env.user.id;
      if (!params[0]) return 'NOT_FOUND';
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return members.length > 0 ? members[0].id.toString() : 'NOT_FOUND';
    },
  ),

  // game
  new Method(
    'game',
    (env) => (env.user.presence.game ? env.user.presence.game.name : ''),
    (env, params) => {
      if (!env.guild) return (env.user.presence.game ? env.user.presence.game.name : '');
      if (!params[0]) return 'NOT_FOUND';
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return (members.length > 0 ? (members[0].user.presence.game ? members[0].user.presence.game.name : '') : 'NOT_FOUND');
    },
  ),

  // status
  new Method(
    'status',
    (env) => env.user.presence.status,
    (env, params) => {
      if (!env.guild) return env.user.presence.status;
      const members = env.client.finder.findMembers(env.guild.members, params[0]);
      return members.length > 0 ? members[0].user.presence.status : 'NOT_FOUND';
    },
  ),

  // atuser
  new Method(
    'atuser',
    (env) => `<@${(env.member && env.member.nickname) ? '!' : ''}${env.user.id}>`,
  ),

  // server
  new Method(
    'server',
    (env) => (env.guild ? env.guild.name : ''),
  ),

  // serverid
  new Method(
    'serverid',
    (env) => (env.guild ? env.guild.id : ''),
  ),

  // servercount
  new Method(
    'servercount',
    (env) => (env.guild ? env.guild.memberCount.toString() : ''),
  ),

  // servericon
  new Method(
    'servericon',
    (env) => (env.guild ? (env.guild.icon ? `https://discordapp.com/icons/${env.guild.id}/${env.guild.icon}.png` : 'NO_ICON') : null),
  ),

  // channel
  new Method(
    'channel',
    (env) => (env.guild ? env.channel.name : 'DM'),
  ),

  // channelid
  new Method(
    'channelid',
    (env) => env.channel.id,
  ),

  // randuser
  new Method(
    'randuser',
    (env) => (env.guild ? env.guild.members.random().user.username : null),
  ),

  // randonline
  new Method(
    'randonline',
    (env) => (env.guild ? env.guild.members.filter(m => m.user.presence.status === 'online').random().user.username : null),
  ),

  // randchannel
  new Method(
    'randchannel',
    (env) => (env.guild ? env.guild.channels.random().name : null),
  ),

  // presencecount
  new Method(
    'presencecount',
    (env) => (env.guild ? env.guild.members.filter(m => m.user.presence.status !== 'offline').size.toString() : ''),
    (env, params) => {
      if (!env.guild || !params[0]) return;
      return env.guild.members.filter(m => m.user.presence.status === params[0].toLowerCase()).size.toString();
    },
  ),

  // attachment
  new Method(
    'attachment',
    null,
    (env, params) => env.attachments[parseInt(params[0], 10)] || '',
  ),

  // attachments
  new Method(
    'attachments',
    (env) => JSON.stringify(env.attachments),
    null,
  ),

  // embed
  new Method(
    'embed',
    null,
    (env, params) => {
      const json = params.join('|');
      try {
        JSON.parse(json); // test JSON validity
        return `|||[|||${env.embedCode}:${json}|||]|||`;
      } catch (e) {}

      const embed = new RichEmbed();

      // Title
      const title = params.find((p) => p.startsWith('title:'));
      if (title && title.length < 262) embed.setTitle(title.substring(6));

      // Description
      const description = params.find((p) => p.startsWith('desc:'));
      if (description && description.length < 2053) embed.setDescription(description.substring(5));

      // Fields
      const fields = params.filter((p) => p.startsWith('field:'));
      fields.forEach((field) => {
        const [name, value, inline] = field.substring(6).split('§');
        if (!value || name.length > 256 || value.length > 1024) return;
        embed.addField(name, value, (inline === 'true'));
      });

      // Image
      const image = params.find((p) => p.startsWith('image:'));
      if (image) embed.setImage(image.substring(6));

      // Thumbnail
      const thumbnail = params.find((p) => p.startsWith('thumb:'));
      if (thumbnail) embed.setThumbnail(thumbnail.substring(6));

      // URL
      const url = params.find((p) => p.startsWith('url:'));
      if (url) embed.setURL(url);

      // Color
      const color = params.find((p) => p.startsWith('color:'));
      if (color) embed.setColor(color.substring(6).toUpperCase());

      // Footer
      const footer = params.find((p) => p.startsWith('footer:'));
      if (footer) {
        const [text, icon] = footer.substring(7).split('§');
        if (text && text.length < 2048) embed.setFooter(text, icon);
      }

      // Author
      const author = params.find((p) => p.startsWith('author:'));
      if (author) {
        const [text, icon] = author.substring(7).split('§');
        if (text && text.length < 256) embed.setAuthor(text, icon);
      }

      // Timestamp
      const timestamp = params.find((p) => p.startsWith('timestamp:'));
      if (timestamp) {
        let time = Date.now();

        const number = Number(timestamp);
        if (isNaN(number)) time = moment(timestamp).valueOf();
        else time = moment(timestamp).valueOf();

        embed.setTimestamp(isNaN(time) ? Date.now() : time);
      }

      return `|||[|||${env.embedCode}:${JSON.stringify(embed)}|||]|||`;
    },
  ),
];
