const moment = require('moment-timezone');

const Command = require('../../structures/Command');

/**
 * Returns an icon URL
 * @param {string} id Icon ID
 * @returns {string}
 */
function icon(id) {
  return `https://developer.accuweather.com/sites/default/files/${id}-s.png`;
}

class WeatherCommand extends Command {
  constructor(client, category) {
    super(client, category, {
      name: 'weather',
      aliases: ['forecast'],
      dm: true,
    });

    /**
     * Emotes for moon phases
     * @type {object}
     */
    this.moons = {
      New: '🌑',
      'Waxing Crescent': '🌒',
      First: '🌓',
      'Waxing Gibbous': '🌔',
      Full: '🌕',
      'Waning Gibbous': '🌖',
      Last: '🌗',
      'Waning Crescent': '🌘',
    };
  }

  async main(message, args) {
    const search = args.join(' ');
    if (!search) {
      message.error(message._('weather.missing'));
      return 0;
    }

    const m = await message.loading(message._('global.loading'));

    // 0- Fetch locations
    const locations = await this.client.apis.getLocations(search, message.locale);
    if (!locations) {
      m.editError(message._('weather.error'));
      return 0;
    }

    if (!locations.length) {
      m.editWarn(message._('weather.none', search));
      return 0;
    }

    if (locations.length > 1) {
      const found = [];
      for (let i = 0; i < (locations.length > 5 ? 5 : locations.length); i += 1) {
        const location = locations[i];
        found.push(`${message.dot} **${location.city}** (${location.state}, ${location.country})`);
      }
      if (locations.length - 10 > 0) {
        found.push(`${message.emote('placeholder')} ${message._('global.more', locations.length - 10)}`);
      }
      m.editWarn(`${message._('weather.multiple', search)}\n${found.join('\n')}`);
      return 0;
    }

    const {
      key,
      city,
      state,
      country,
    } = locations[0];

    const pages = [];
    const entries = [];

    // 1- Fetch current weather
    const current = await this.client.apis.getCurrentWeather(key, message.locale);
    if (!current) {
      message.editError(message._('weather.error'));
      return 0;
    }

    pages.push({
      title: message._('weather.now'),
      thumbnail: icon(current.icon),
    });

    entries.push([
      `${message.dot} ${message._('weather.condition')}: **${current.condition}**`,
      `${message.dot} ${message._('weather.temperature')}: ${message._('weather.format.temperature', current.temperature)}`,
      `${message.dot} ${message._('weather.feel')}: ${message._('weather.format.feel', current.feel)}`,
      `${message.dot} ${message._('weather.wind')}: ${message._('weather.format.wind', current.wind, current.gust)}`,
      `${message.dot} ${message._('weather.uv')}: ${message._('weather.format.uv', current.uvindex)}`,
      `${message.dot} ${message._('weather.humidity')}: ${message._('weather.format.humidity', current.humidity)}`,
      `${message.dot} ${message._('weather.pressure')}: ${message._('weather.format.pressure', current.pressure)}`,
      `${message.dot} ${message._('weather.nebulosity')}: ${message._('weather.format.nebulosity', current.nebulosity)}`,
    ].join('\n'));

    // 2- Fetch forecast
    const forecast = await this.client.apis.getForecast(key, message.locale);
    if (!forecast) {
      message.editError(message._('weather.error'));
      return 0;
    }

    for (let i = 0; i < (forecast ? forecast.length : 0); i += 1) {
      const day = forecast[i];

      pages.push({
        title: i ? moment(day.date).locale(message.locale).format(message._('weather.format.day')) : message._('weather.today'),
        thumbnail: icon(day.icon),
      });

      entries.push([
        `${message.dot} ${message._('weather.condition')}: **${day.condition}**`,
        `${message.dot} ${message._('weather.temperature')}: ${message._('weather.format.temperatures', day.temperatures)}`,
        `${message.dot} ${message._('weather.wind')}: ${message._('weather.format.wind', day.wind, day.gust)}`,
        `${message.dot} ${message._('weather.uv')}: ${message._('weather.format.uv', day.uvindex)}`,
        `${message.dot} ${message._('weather.nebulosity')}: ${message._('weather.format.nebulosity', day.nebulosity)}`,
        `${message.dot} ${message._('weather.sunrise')}: **${moment(day.sun[0]).format(message._('weather.format.time'))}** - ${message._('weather.sunset')}: **${moment(day.sun[1]).format(message._('weather.format.time'))}**`,
        `${message.dot} ${message._('weather.moon')}: ${message._('weather.format.moon', this.moons[day.moon], message._(`weather.moons.${day.moon}`))}`,
      ].join('\n'));
    }

    // 3- Send menu
    m.delete();
    this.client.menuUtil.createMenu(
      message.channel.id,
      message.author.id,
      message.id,
      message.locale,
      message._('weather.title', city, state, country),
      pages,
      entries,
      { entriesPerPage: 1, footer: message._('weather.footer') },
    );

    return 0;
  }
}

module.exports = WeatherCommand;
