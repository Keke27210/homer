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
      const time = isNaN(parseInt(params[0])) ? params[0] : parseInt(params[0]);
      const format = params.slice(1).join('|') || `${env.settings.misc.dateFormat} ${env.settings.misc.timeFormat}`;

      return mtz(time)
        .locale(env.settings.misc.locale)
        .tz(env.settings.misc.timezone)
        .format(format);
    },
  ),
];
