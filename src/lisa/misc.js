const Method = require('../structures/Method');
const fetch = require('node-fetch');

const domainExpression = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im;
const propertyExpression = /{item.(.*?)}/g;

module.exports = [
  // exec
  new Method(
    'exec',
    null,
    async (env, params) => {
      if (env.children || !params[0]) return;

      const name = params[0];
      const args = params.slice(1);

      const tag = await env.client.tags.getTag(name);
      if (!tag) return 'UNKNOWN_TAG';

      const parsed = await env.client.lisaManager.parseString(env, tag.content, 'childrenTag', args, true, env.embedCode);
      env.embed = parsed.embed;
      return parsed.content;
    },
    ['|with:'],
  ),

  // http
  new Method(
    'http',
    null,
    async (env, params) => {
      const url = params[0];

      const domainTest = domainExpression.exec(url);
      if (!domainTest) return 'NO_URL';

      const options = {
        method: params[1] ? 'post' : 'get',
        headers: {
          'User-Agent': 'HomerBot / Lisa',
        },
        timeout: 5000,
      };

      if (params[1]) {
        let contentType;
        try { params[1] = JSON.parse(params[1]); contentType = 'application/json'; }
        catch { contentType = 'text/plain'; }

        options.headers['Content-Type'] = contentType;
        [, options.body] = params;
      }

      const request = await fetch(url, options)
        .then(async (r) => {
          try { return JSON.stringify(await r.text()); }
          catch { return (r.ok ? `HTTP_RESPONSE_${r.status}` : `HTTP_ERROR_${r.status}`); }
        })
        .catch(() => 'HTTP_ERROR_UNKNOWN');

      return request;
    },
    ['|body:'],
  ),

  // json
  new Method(
    'json',
    null,
    (env, params) => {
      // Check if params after the first one contains },
      // if yes it means JSON is not finished to put them back with params[0]
      for (let i = 1; i < params.length; i += 1) {
        const param = params[i];
        if (param.includes('{') || param.includes('}')) {
          // eslint-disable-next-line no-param-reassign
          params[0] = `${params[0]}|${param}`;
          params.splice(i, 1);
        }
      }

      let json = null;
      try { json = JSON.parse(params[0]); }
      catch (e) { return e.message; }

      if (!params[1]) return '';
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
            for (let k = 0; k < properties.length; k += 1) item2 = item[properties[k]];
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
