const Method = require('../structures/Method');

function evaluateMath(statement) {
  const [operand1, operator, operand2] = statement.split('|');

  const res1 = evaluateMath(operand1);
  const res2 = evaluateMath(operand2);
  let res;

  const n1 = parseFloat(operand1);
  const n2 = parseFloat(operand2);

  if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
    switch (operator) {
      case '+':
        res = n1 + n2;
        break;
      case '-':
        res = n1 - n2;
        break;
      case '*':
        res = n1 * n2;
        break;
      case '/':
        res = n1 / n2;
        break;
      case '%':
        res = n1 % n2;
        break;
      case '^':
        res = n1 ** n2;
        break;
      default:
        res = 0;
    }
  } else {
    switch (operator) {
      case '+':
        res = `${res1}|+|${res2}`;
        break;
      case '-':
        res = `${res1}|-|${res2}`;
        break;
      case '*':
        res = `${res1}|*|${res2}`;
        break;
      case '/':
        res = `${res1}|/|${res2}`;
        break;
      case '%':
        res = `${res1}|%|${res2}`;
        break;
      case '^':
        res = `${res1}|^|${res2}`;
        break;
      default:
        res = 0;
    }
  }

  return String(res);
}

function evaluateStatement(statement) {
  const [operand1, operator, operand2] = statement.split('|');

  const n1 = parseFloat(operand1);
  const n2 = parseFloat(operand2);

  if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
    switch (operator) {
      case '=':
        return (n1 === n2);
      case '~':
        return ((n1 * 100) === (n2 * 100));
      case '>':
        return (n1 > n2);
      case '<':
        return (n1 < n2);
      default:
        return false;
    }
  } else {
    switch (operator) {
      case '=':
        return (operand1 === operand2);
      case '~':
        // eslint-disable-next-line eqeqeq
        return (operand1.toLowerCase() == operand2.toLowerCase());
      case '>':
        return (operand1.compareTo(operand2) > 0);
      case '<':
        return (operand1.compareTo(operand2) < 0);
      case '?':
        try { return operand1.match(new RegExp(operand2, 'igm')); } catch (e) { return false; }
      case '%':
        return operand1.toLowerCase().includes(operand2.toLowerCase());
      default:
        return false;
    }
  }
}

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
    (_, params) => params[Math.floor(params.length * Math.random())],
  ),

  // range
  new Method(
    'range',
    null,
    (_, params) => {
      try {
        let i1 = Number(params[0]);
        let i2 = Number(params[1]);
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
    (_, params) => {
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
    (_, params) => evaluateMath(params.join('|')).toString(),
  ),

  // random
  new Method(
    'random',
    () => Math.random().toString(),
    null,
  ),

  // abs
  new Method(
    'abs',
    null,
    (_, params) => Math.abs(params[0]).toString(),
  ),

  // floor
  new Method(
    'floor',
    null,
    (_, params) => Math.floor(params[0]).toString(),
  ),

  // ceil
  new Method(
    'ceil',
    null,
    (_, params) => Math.ceil(params[0]).toString(),
  ),

  // round
  new Method(
    'round',
    null,
    (_, params) => Math.round(params[0]).toString(),
  ),

  // sin
  new Method(
    'sin',
    null,
    (_, params) => Math.sin(params[0]).toString(),
  ),

  // cos
  new Method(
    'cos',
    null,
    (_, params) => Math.cos(params[0]).toString(),
  ),

  // tan
  new Method(
    'tan',
    null,
    (_, params) => Math.tan(params[0]).toString(),
  ),

  // asin
  new Method(
    'asin',
    null,
    (_, params) => Math.asin(params[0]).toString(),
  ),

  // acos
  new Method(
    'acos',
    null,
    (_, params) => Math.acos(params[0]).toString(),
  ),

  // atan
  new Method(
    'atan',
    null,
    (_, params) => Math.atan(params[0]).toString(),
  ),

  // natural logarithm
  new Method(
    'log',
    null,
    (_, params) => Math.log(params[0]).toString(),
  ),

  // base 10 logarithm
  new Method(
    'log10',
    null,
    (_, params) => Math.log10(params[0]).toString(),
  ),

  // base 2 logarithm
  new Method(
    'log2',
    null,
    (_, params) => Math.log2(params[0]).toString(),
  ),

  // Neper constant (used by natural logarithms)
  new Method(
    'e',
    () => Math.E.toString(),
    null,
  ),

  // exp
  new Method(
    'exp',
    null,
    (_, params) => Math.exp(params[0]).toString(),
  ),

  // pi
  new Method(
    'pi',
    () => Math.PI.toString(),
    null,
  ),
];
