const fetch = require('node-fetch');

/**
 * Converts a temperature in farhenheit into celsius
 * @param {number} t Temperature (in farhenheit)
 * @returns {number} Temperature (in celsius)
 */
function toCelcius(t) {
  return Math.round((t - 32) * (5 / 9));
}

/**
 * Converts a speed in mph into kph
 * @param {number} s Temperature (in mph)
 * @returns {number} Temperature (in kph)
 */
function toKph(s) {
  return Math.round(s * 1.60934);
}

const Provider = require('./Provider');

const TABLE_COLUMNS = [
  ['id', 'SERIAL', 'PRIMARY KEY'],
  ['name', 'VARCHAR(10)', 'NOT NULL'],
  ['key', 'VARCHAR(200)', 'NOT NULL'],
];

class APIProvider extends Provider {
  constructor(client) {
    super(client, 'api', TABLE_COLUMNS);
  }

  /**
   * Fetches an API key
   * @param {string} name Key's name
   * @returns {Promise<?string>}
   */
  async fetchKey(name) {
    if (!name) throw new Error('NO_NAME');
    const rows = await this.getRows([
      ['name', '=', name],
    ]);
    if (!rows.length) return null;
    return rows[0];
  }

  /**
   * Searches for locations
   * @param {string} search Search
   * @param {string} locale Locale
   * @returns {Promise<Location[]>}
   */
  async getLocations(search, locale) {
    const locations = [];
    const api = await this.fetchKey('weather');
    if (!api) return locations;

    const res = await fetch(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${api.key}&q=${encodeURIComponent(search)}&language=${locale}&details=false&limit=5`)
      .then((r) => r.json())
      .catch((error) => {
        this.client.logger.error(`[apis->getLocation] Cannot get locations for "${search}" (locale: ${locale})`, error);
        throw new Error('FETCH_ERROR');
      });

    if (!res || res.Code) return null;

    for (let i = 0; i < res.length; i += 1) {
      const data = res[i];
      if (data.Type !== 'City') continue;

      locations.push({
        key: data.Key,
        city: data.LocalizedName,
        state: data.AdministrativeArea.LocalizedName,
        country: data.Country.LocalizedName,
      });
    }

    return locations;
  }

  /**
   * Obtains weather for the specified city
   * @param {string} city City key
   * @param {string} locale Locale
   * @returns {Promise<WeatherCurrent>}
   */
  async getCurrentWeather(city, locale) {
    const api = await this.fetchKey('weather');
    if (!api) return null;

    const res = await fetch(`http://dataservice.accuweather.com/currentconditions/v1/${city}?apikey=${api.key}&language=${locale}&details=true`)
      .then((r) => r.json())
      .catch((error) => {
        this.client.logger.error(`[apis->getCurrentWeather] Cannot get current conditions for city ${city} (locale: ${locale})`, error);
        throw new Error('FETCH_ERROR');
      });

    if (!res || res.Code) return null;

    const data = res[0];
    const current = {
      condition: data.WeatherText,
      icon: data.WeatherIcon < 10 ? `0${data.weatherIcon}` : String(data.weatherIcon),
      temperature: [data.Temperature.Metric.Value, data.Temperature.Imperial.Value],
      feel: [data.RealFeelTemperature.Metric.Value, data.RealFeelTemperature.Imperial.Value],
      wind: {
        direction: data.Wind.Direction.Localized,
        speed: [data.Wind.Speed.Metric.Value, data.Wind.Speed.Imperial.Value],
      },
      gust: [data.WindGust.Speed.Metric.Value, data.WindGust.Speed.Imperial.Value],
      uv: {
        index: data.UVIndex,
        text: data.UVIndexText,
      },
      pressure: data.Pressure.Metric.Value,
      humidity: data.RelativeHumidity,
      nebulosity: data.CloudCover,
    };

    return current;
  }

  /**
   * Obtains forecast for the specified city
   * @param {string} city City key
   * @param {string} locale Locale
   * @returns {Promise<Forecast[]>}
   */
  async getForecast(city, locale) {
    const api = await this.fetchKey('weather');
    if (!api) return null;

    const res = await fetch(`http://dataservice.accuweather.com/forecasts/v1/daily/5day/${city}?apikey=${api.key}&language=${locale}&details=true`)
      .then((r) => r.json())
      .catch((error) => {
        this.client.logger.error(`[apis->getForecast] Cannot get current forecast for city ${city} (locale: ${locale})`, error);
        throw new Error('FETCH_ERROR');
      });

    if (!res || res.Code) return null;

    const forecast = [];

    for (let i = 0; i < res.DailyForecasts.length; i += 1) {
      const data = res.DailyForecasts[i];
      forecast.push({
        date: data.EpochDate * 1000,
        condition: data.Day.ShortPhrase,
        icon: data.Day.Icon < 10 ? `0${data.Day.Icon}` : String(data.Day.Icon),
        temperatures: {
          max: [toCelcius(data.Temperature.Maximum.Value), data.Temperature.Maximum.Value],
          min: [toCelcius(data.Temperature.Minimum.Value), data.Temperature.Minimum.Value],
        },
        wind: {
          direction: data.Day.Wind.Direction.Localized,
          speed: [toKph(data.Day.Wind.Speed.Value), data.Day.Wind.Speed.Value],
        },
        gust: [toKph(data.Day.WindGust.Speed.Value), data.Day.WindGust.Speed.Value],
        uv: {
          index: data.AirAndPollen.find((d) => d.Name === 'UVIndex').CategoryValue,
          text: data.AirAndPollen.find((d) => d.Name === 'UVIndex').Category,
        },
        nebulosity: data.Day.CloudCover,
        sun: [(data.Sun.EpochRise * 1000), (data.Sun.EpochSet * 1000)],
        moon: data.Moon.Phase,
      });
    }

    return forecast;
  }
}

module.exports = APIProvider;
