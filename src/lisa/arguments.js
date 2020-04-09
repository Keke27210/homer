const Method = require('../structures/Method');

module.exports = [
  // args
  new Method(
    'args',
    (env) => env.args.join(' '),
  ),

  // argslen
  new Method(
    'argslen',
    (env) => env.args.length.toString(),
  ),

  // arg
  new Method(
    'arg',
    null,
    (env, params) => env.args[params[0]] || '',
  ),
];
