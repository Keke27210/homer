const bigInteger = require('big-integer');
const Method = require('../structures/Method');

module.exports = [
  // note
  new Method(
    'note',
    null,
    () => '',
  ),

  // choose
  new Method(
    'choose',
    null,
    (env, params) => params[Math.floor(params.length * Math.random())],
  ),

  // range
  new Method(
    'range',
    null,
    (env, params) => {
      try {
        const i1 = parseInt(params[0]);
        const i2 = parseInt(params[1]);
        if (i2 < i1) {
          const tmp = i2;
          i2 = i1;
          i1 = tmp;
        }

        return Math.floor(i1 + (Math.random() * (i2 - i1))).toString();
      } catch (e) {
        return `${params[0]}|${params[1]}`;
      }
    },
  ),

  // if
  new Method(
    'if',
    null,
    (env, params) => {
      if (params[0].toLowerCase() === 'true') return params[1];
      if (params[0].toLowerCase() === 'false') return params[2];

      const result = evaluateStatement(params[0]);
      return (result ? params[1] : params[2]);
    },
    ['|then:', '|else:'],
  ),

  // math
  new Method(
    'math',
    null,
    (env, params) => evaluateMath(params.join('|')).toString(),
  ),

  // random
  new Method(
    'random',
    (env) => Math.random().toString(),
    null,
  ),

  // abs
  new Method(
    'abs',
    null,
    (env, params) => Math.abs(params[0]).toString(),
  ),

  // floor
  new Method(
    'floor',
    null,
    (env, params) => Math.floor(params[0]).toString(),
  ),

  // ceil
  new Method(
    'ceil',
    null,
    (env, params) => Math.ceil(params[0]).toString(),
  ),

  // round
  new Method(
    'round',
    null,
    (env, params) => Math.round(params[0]).toString(),
  ),

  // sin
  new Method(
    'sin',
    null,
    (env, params) => Math.sin(params[0]).toString(),
  ),

  // cos
  new Method(
    'cos',
    null,
    (env, params) => Math.cos(params[0]).toString(),
  ),

  // tan
  new Method(
    'tan',
    null,
    (env, params) => Math.tan(params[0]).toString(),
  ),

  // asin
  new Method(
    'asin',
    null,
    (env, params) => Math.asin(params[0]).toString(),
  ),

  // acos
  new Method(
    'acos',
    null,
    (env, params) => Math.acos(params[0]).toString(),
  ),

  // atan
  new Method(
    'atan',
    null,
    (env, params) => Math.atan(params[0]).toString(),
  ),

  // natural logarithm
  new Method(
    'log',
    null,
    (env, params) => Math.log(params[0]).toString(),
  ),

  // base 10 logarithm
  new Method(
    'log10',
    null,
    (env, params) => Math.log10(params[0]).toString(),
  ),

  // base 2 logarithm
  new Method(
    'log2',
    null,
    (env, params) => Math.log2(params[0]).toString(),
  ),

  // Neper constant (used by natural logarithms)
  new Method(
    'e',
    (env) => Math.E.toString(),
    null,
  ),

  // exp
  new Method(
    'exp',
    null,
    (env, params) => Math.exp(params[0]).toString(),
  ),

  // base
  new Method(
    'base',
    null,
    (env, params) => bigInteger(params[0], params[1]).toString(params[2]),
  ),
];

function evaluateMath(statement) {
  let index = statement.lastIndexOf('|+|');
  if (index === -1) index = statement.lastIndexOf('|-|');
  if (index === -1) index = statement.lastIndexOf('|*|');
  if (index === -1) index = statement.lastIndexOf('|%|');
  if (index === -1) index = statement.lastIndexOf('|/|');
  if (index === -1) index = statement.lastIndexOf('|^|');
  if (index === -1) return statement;

  const first = evaluateMath(statement.substring(0, index)).trim();
  const second = evaluateMath(statement.substring(index + 3)).trim();

  let val1;
  let val2;
  try {
    val1 = parseFloat(first);
    val2 = parseFloat(second);

    switch (statement.substring(index, index + 3)) {
      case '|+|':
        return `${val1 + val2}`;
      case '|-|':
        return `${val1 - val2}`;
      case '|*|':
        return `${val1 * val2}`;
      case '|%|':
        return `${val1 % val2}`;
      case '|/|':
        return `${val1 / val2}`;
      case '|^|':
        return `${Math.pow(val1, val2)}`;
    }
  } catch (e) {}

  switch (statement.substring(index, index + 3)) {
    case '|+|':
      return `${first}+${second}`;
    case '|-|':
      const loc = first.indexOf(second);
      if (loc !== -1) return first.substring(0, loc) + ((loc + second.length < first.length) ? first.substring(loc + second.length) : '');
      return `${first}-${second}`;
    case '|*|':
      return `${first}*${second}`;
    case '|%|':
      return `${first}%${second}`;
    case '|/|':
      return `${first}/${second}`;
    case '|^|':
      return `${first}^${second}`;
  }

  return statement;
}

function evaluateStatement(statement) {
  let index = statement.lastIndexOf('|=|');
  if (index === -1) index = statement.lastIndexOf('|<|');
  if (index === -1) index = statement.lastIndexOf('|>|');
  if (index === -1) index = statement.lastIndexOf('|~|');
  if (index === -1) index = statement.lastIndexOf('|?|');
  if (index === -1) index = statement.lastIndexOf('|%|');
  if (index === -1) return statement;

  const s1 = statement.substring(0, index).trim();
  const s2 = statement.substring(index + 3).trim().split('|')[0];

  if (!isNaN(s1) && !isNaN(s2)) {
    const i1 = parseFloat(s1);
    const i2 = parseFloat(s2);

    switch (statement.substring(index, index + 3)) {
      case '|=|':
        return (i1 === i2);
      case '|~|':
        return ((i1 * 100) === (i2 * 100));
      case '|>|':
        return (i1 > i2);
      case '|<|':
        return (i1 < i2);
    }
  } else {
    switch (statement.substring(index, index + 3)) {
      case '|=|':
        return (s1 === s2);
      case '|~|':
        return (s1.toLowerCase() == s2.toLowerCase());
      case '|>|':
        return (s1.compareTo(s2) > 0);
      case '|<|':
        return (s1.compareTo(s2) < 0);
      case '|?|':
        try { return s1.match(new RegExp(s2, 'igm')); } catch (e) { return null; }
      case '|%|':
        return s1.toLowerCase().includes(s2.toLowerCase());
    }
  }

  return false;
}
