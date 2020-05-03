const Method = require('../structures/Method');

function zeroPad(num) {
  return '00000000'.slice(String(num).length) + num;
}

module.exports = [
  // lower
  new Method(
    'lower',
    null,
    (env, params) => params.join('|').toLowerCase(),
  ),

  // upper
  new Method(
    'upper',
    null,
    (env, params) => params.join('|').toUpperCase(),
  ),

  // length
  new Method(
    'length',
    null,
    (env, params) => {
      let input = params.join('|');
      if (Number.isNaN(parseInt(input, 10))) {
        try {
          input = JSON.parse(input);
        } catch {
          input = '';
        }
      }
      return input.length.toString();
    },
  ),

  // url
  new Method(
    'url',
    null,
    (env, params) => encodeURIComponent(params.join('|')),
  ),

  // includes
  new Method(
    'includes',
    null,
    (env, params) => String(params[1].includes(params[0])),
    ['|in:'],
  ),

  // replace
  new Method(
    'replace',
    null,
    (env, params) => params[2].replaceAll(params[0], params[1]),
    ['|with:', '|in:'],
  ),

  // replaceregex
  new Method(
    'replaceregex',
    null,
    (env, params) => params[2].replace(new RegExp(params[0], 'igm'), params[1]),
    ['|with:', '|in:'],
  ),

  // substring
  new Method(
    'substring',
    null,
    (env, params) => {
      const string = params.slice(2).join('|');
      let start = Number(params[0]);
      let end = Number(params[1], 10);
      if (Number.isNaN(start)) start = 0;
      if (Number.isNaN(end)) end = string.length;

      if (start < 0) start += string.length;
      if (end < 0) end += string.length;
      if (end <= start || end <= 0 || start >= string.length) return null;
      if (end > string.length) end = string.length;
      if (start < 0) start = 0;

      return params.slice(2).join('|').substring(start, end);
    },
  ),

  // oneline
  new Method(
    'oneline',
    null,
    (env, params) => params.join('|').replace(/[\r\n\u0085\u2028\u2029]+/g, ' ').trim(),
  ),

  // hash
  new Method(
    'hash',
    null,
    (env, params) => params.join('|').hashCode().toString(),
  ),

  // encode
  new Method(
    'encode',
    null,
    (env, params) => {
      if (!params[0] || !params[1]) return '';

      if (params[1] === 'binary') {
        const output = params[0].replace(/[\s\S]/g, (str) => `${zeroPad(str.charCodeAt().toString(2))} `);
        return output.endsWith(' ') ? output.substring(0, (output.length - 1)) : output;
      }

      return Buffer.from(params[0]).toString(params[1]);
    },
    ['|in:'],
  ),

  // decode
  new Method(
    'decode',
    null,
    (env, params) => {
      if (!params[0] || !params[1]) return '';

      if (params[1] === 'binary') {
        return params[0].replace(/\s*[01]{8}\s*/g, (bin) => String.fromCharCode(parseInt(bin, 2)));
      }

      return Buffer.from(params[0], params[1]).toString();
    },
    ['|from:'],
  ),

  // repeat
  new Method(
    'repeat',
    null,
    (env, params) => {
      const [text,, separator] = params;
      let [, times] = params;
      if (!text || !times) return '';
      times = parseInt(times, 10);
      if (times < 1 || times > 10) return 'RANGE_ERROR';

      const repeated = [];
      for (let i = 0; i < times; i += 1) repeated.push(text);
      return repeated.join(separator || '');
    },
  ),

  // reverse
  new Method(
    'reverse',
    null,
    (env, params) => {
      const original = params.join('|');
      let str = '';

      for (let i = (original.length - 1); i >= 0; i -= 1) str += original[i];
      return str;
    },
  ),

  // emote
  new Method(
    'emote',
    null,
    (env, params) => {
      const name = params[0];
      if (!name) return '';

      const emote = env.client.emojis.resolve(params[0]);
      return emote ? emote.toString() : '';
    },
  ),
];
