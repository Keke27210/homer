const Method = require('../structures/Method');
const { RichEmbed } = require('discord.js');
const request = require('superagent');

const domainExpression = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im;
const propertyExpression = /{item.(.*?)}/g;

module.exports = [
  // uid
  new Method(
    'uuid',
    () => uuid(),
  ),

  // exec
  new Method(
    'exec',
    null,
    async (env, params) => {
      if (env.children || !params[0]) return;

      const name = params[0];
      const args = params.slice(1);

      const tag = await env.client.database.getDocument('tags', name);
      if (!tag) return 'UNKNOWN_TAG';

      const parsed = await env.client.lisa.parseString(env, tag.content, 'childrenTag', args, true, env.embedCode);
      env.embed = parsed.embed;
      return parsed.content;
    },
    ['|with:'],
  ),

  // embed
  new Method(
    'embed',
    null,
    (env, params) => {
      const json = params.join('|');
      try {
        JSON.parse(json);
        return `|||[|||${env.embedCode}:${json}|||]|||`;
      } catch (e) {}

      const embed = new RichEmbed();

      const title = params.find(p => p.startsWith('title:'));
      if (title && title.length < 262) embed.setTitle(title.substring(6));

      const description = params.find(p => p.startsWith('desc:'));
      if (description && description.length < 2053) embed.setDescription(description.substring(5));

      const fields = params.filter(p => p.startsWith('field:'));
      for (const field of fields) {
        const [name, value, inline] = field.substring(6).split('§');
        if (!value || name.length > 256 || value.length > 1024) continue;
        embed.addField(name, value, inline === 'true' ? true : false);
      }

      const image = params.find(p => p.startsWith('image:'));
      if (image) try { embed.setImage(image.substring(6)); } catch (e) {}

      const thumbnail = params.find(p => p.startsWith('thumb:'));
      if (thumbnail) try { embed.setThumbnail(thumbnail.substring(6)); } catch (e) {}

      const url = params.find(p => p.startsWith('url:'));
      if (url) try { embed.setURL(url.substring(4)); } catch (e) {}

      const color = params.find(p => p.startsWith('color:'));
      if (color) embed.setColor(color.substring(6).toUpperCase());

      const footer = params.find(p => p.startsWith('footer:'));
      if (footer) {
        const [text, icon] = footer.substring(7).split('§');
        if (text && text.length < 2048) embed.setFooter(text, icon || null);
      }

      const author = params.find(p => p.startsWith('author:'));
      if (author) {
        const [text, icon] = author.substring(7).split('§');
        if (text && text.length < 256) embed.setAuthor(text, icon || null);
      }

      const timestamp = params.find(p => p.startsWith('timestamp:'));
      if (timestamp) {
        const parsed = Date.parse(timestamp.substring(10));
        try { embed.setTimestamp(new Date(parsed)); } catch (e) {}
      }

      return `|||[|||${env.embedCode}:${JSON.stringify(embed)}|||]|||`;
    },
  ),

  // http
  new Method(
    'http',
    null,
    async (env, params) => {
      const url = params[0];

      const domainTest = domainExpression.exec(url);
      if (!domainTest) return 'NO_URL';

      const whitelist = await env.client.database.getDocument('bot', 'settings').then(s => s.domainWhitelist);
      if (!whitelist.includes(domainTest[1].toLowerCase())) return 'UNAUTHORIZED_DOMAIN';

      const req = (params[1] ? request.post(url) : request.get(url))
        .set('User-Agent', 'HomerBot / Lisa');

      if (params[1]) {
        let contentType = 'text/plain';
        try { params[1] = JSON.parse(params[1]); contentType = 'application/json'; }
        catch (e) {}

        req
          .set('Content-Type', contentType)
          .send(params[1]);
      }

      return (await req.then(r => r.text || `HTTP_RESPONSE_${r.status}`).catch(r => `HTTP_ERROR_${r.status}`));
    },
    ['|body:'],
  ),

  // json
  new Method(
    'json',
    null,
    (env, params) => {
      let json = null;
      try { json = JSON.parse(params[0]); }
      catch (e) { return e.message; }

      if (!params[1]) return;
      const path = params.slice(1);

      let current = json;
      for (let i = 0; i < path.length; i += 1) {
        try { current = typeof current[path[i]] === 'number' ? current[path[i]] : (current[path[i]] || 'undefined'); }
        catch (e) { return 'undefined'; }
      }

      if (Array.isArray(current) || typeof current === 'object') return JSON.stringify(current);
      if (typeof current === 'number') return current.toString();
      if (typeof current === 'boolean') return (current ? 'true' : 'false');
      if (typeof current === 'function') return 'CANNOT_RETURN_FUNCTION';
      return current;
    },
  ),

  // map
  new Method(
    'map',
    null,
    (env, params) => {
      let array = null;
      try { array = JSON.parse(params[0]); }
      catch (e) { return '<invalid array>'; }

      return array
        .map((item, index) => {
          let str = params[1]
            .replace(/{item}/g, typeof item === 'object' ? JSON.stringify(item) : String(item))
            .replace(/{index}/g, index.toString());

          const propertyTest = str.match(propertyExpression);
          if (!propertyTest) return str;

          for (let i = 0; i < propertyTest.length; i += 1) {
            const property = propertyExpression.exec(propertyTest[i]);
            propertyExpression.lastIndex = 0;

            const properties = property[1].split('.');
            let item2 = item;
            for (let i = 0; i < properties.length; i += 1) item2 = item[properties[i]];
            str = str.replace(property[0], typeof item2 === 'object' ? JSON.stringify(item2) : String(item2));
          }

          return str;
        })
        .join(params[2] || ', ');
    },
  ),

  // split
  new Method(
    'split',
    null,
    (env, params) => {
      const [text, split] = params;
      if (!text) return 'NO_TEXT_PROVIDED';
      return JSON.stringify(text.split(split));
    },
    ['|with:'],
  ),

  // typeof
  new Method(
    'typeof',
    null,
    (env, params) => {
      const item = params.join('|');
      if (item === 'true' || item === 'false') return 'boolean';
      if (!Number.isNaN(Number(item))) return 'number';
      try {
        const temp = JSON.parse(item);
        return Array.isArray(temp) ? 'array' : 'object';
      } catch (e) {
        return 'string';
      }
    },
  ),

  // isfloat
  new Method(
    'isfloat',
    null,
    (env, params) => {
      if (Number.isNaN(Number(params[0]))) return 'NaN';
      return params[0].includes('.') ? 'true' : 'false';
    },
  ),

  // nsfw
  // just replace with blank
  new Method(
    'nsfw',
    () => '',
    null,
  ),
];

function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}
