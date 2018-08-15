const Method = require('../structures/Method');
const { RichEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const { inspect } = require('util');

const domainExpression = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im;
const propertyExpression = /{item.(.*)}/g;

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

      const parsed = await env.client.lisa.parseString(env, tag.content, 'childrenTag', args, true);
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

      return `|||[|||${env.client.config.secretEmbedMethod}:${JSON.stringify(embed)}|||]|||`;
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

      const result = await snekfetch
        .get(url)
        .set('User-Agent', 'HomerBot using Lisa Tags')
        .then(r => r.text)
        .catch(r => `HTTP_ERROR_${r.status}`);

      return result;
    },
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
      else if (typeof current === 'number') return current.toString();
      else if (typeof current === 'boolean') return (current ? 'true' : 'false');
      else if (typeof current === 'function') return 'CANNOT_RETURN_FUNCTION';
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
        .map((item) => {
          if (!params[1]) return (typeof item === 'object') ? JSON.stringify(item) : item;

          const propertyTest = params[1].match(propertyExpression);
          if (!propertyTest || typeof item !== 'object') return params[1].replace(/{item}/g, typeof item === 'object' ? JSON.stringify(item) : item);

          for (const tmpProp of propertyTest) {
            const prop = domainExpression.exec(tmpProp); 
            let current;
            try { current = JSON.parse(item); }
            catch (e) { current = item; }
            for (let i = 0; i < prop[1].length; i += 1) {
              const property = current[prop[1][i]];
              if (!property) {
                current = 'undefined';
                break;
              }
              current = property;
            }
            params[1] = params[1].replace(tmpProp, typeof current === 'object' ? JSON.stringify(current) : current);
          }

          return params[1].replace(/{item}/g, typeof item === 'object' ? JSON.stringify(item) : item);
        })
        .join(params[2] || ', ');
    },
  ),

  // typeof
  new Method(
    'typeof',
    null,
    (env, params) => {
      try { params[0] = JSON.parse(params[0]); } catch (e) {}
      if (!Number.isNaN(parseInt(params[0]))) params[0] = parseInt(params[0]);

      return typeof params[0];
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
