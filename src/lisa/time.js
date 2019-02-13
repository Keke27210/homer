const mtz = require('moment-timezone');
const Method = require('../structures/Method');

module.exports = [
  // now
  new Method(
    'now',
    env => mtz()
      .locale(env.settings.misc.locale)
      .tz(env.settings.misc.timezone)
      .format(`${env.settings.misc.dateFormat} ${env.settings.misc.timeFormat}`),
    (env, params) => mtz()
      .locale(env.settings.misc.locale)
      .tz(env.settings.misc.timezone)
      .format(params[0]),
  ),

  // time
  new Method(
    'time',
    null,
    (env, params) => {
      const time = isNaN(Number(params[0])) ? params[0] : Number(params[0]);
      const format = params.slice(1).join('|') || `${env.settings.misc.dateFormat} ${env.settings.misc.timeFormat}`;

      return mtz(time)
        .locale(env.settings.misc.locale)
        .tz(env.settings.misc.timezone)
        .format(format);
    },
  ),

  // time since / time to
  new Method(
    'timeto',
    null,
    (env, params) => {
      const time = Number(params[0]);
      if (Number.isNaN(time)) return 'INVALID_TIME';

      const short = params[1] === 'true' ? true : false;
      const ago = params[2] === 'true' ? true : false;
      return env.client.time.timeSince(time, env.settings.misc.locale, short, ago);
    },
  ),
];
