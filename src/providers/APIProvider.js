const fetch = require('node-fetch');
const parser = require('fast-xml-parser');
const moment = require('moment-timezone');

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

    /**
     * Options for the XML parser
     * @type {object}
     */
    this.parserOptions = {
      attributeNamePrefix: '',
      textNodeName: 'text',
      ignoreAttributes: false,
    };
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

    const res = await fetch(`http://samsungmobile.accu-weather.com/widget/samsungmobile/city-find.asp?location=${encodeURIComponent(search)}&language=${locale}`)
      .then((r) => r.text())
      .then((data) => parser.parse(data, this.parserOptions).adc_database.citylist.location)
      .catch((error) => {
        this.client.logger.error(`[apis->getLocation] Cannot get locations for "${search}" (locale: ${locale})`, error);
        throw new Error('FETCH_ERROR');
      });

    if (!res) return null;

    for (let i = 0; i < res.length; i += 1) {
      const data = res[i];
      const stateInfo = data.state
        .split('(')
        .map((item) => item.trim().replace(')', ''));

      locations.push({
        key: data.location,
        city: data.city,
        state: stateInfo.length > 1 ? stateInfo[1] : stateInfo[0],
        country: stateInfo.length > 1 ? stateInfo[0] : 'United States',
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
    const res = await fetch(`http://accuwxandroidv3.accu-weather.com/widget/accuwxandroidv3/weather-data.asp?location=${city}&language=${locale}`)
      .then((r) => r.text())
      .then((data) => parser.parse(data, this.parserOptions).adc_database)
      .catch((error) => {
        this.client.logger.error(`[apis->getCurrentWeather] Cannot get current conditions for city ${city} (locale: ${locale})`, error);
        throw new Error('FETCH_ERROR');
      });

    if (!res) return null;

    const data = res.currentconditions;
    const current = {
      condition: data.weathertext,
      icon: data.weathericon < 10 ? `0${data.weathericon}` : String(data.weathericon),
      temperature: [toCelcius(data.temperature), data.temperature],
      feel: [toCelcius(data.realfeel), data.realfeel],
      wind: {
        direction: data.winddirection,
        speed: [toKph(data.windspeed), data.windspeed],
      },
      gust: [toKph(data.windgusts), data.windgusts],
      uvindex: data.uvindex.index,
      pressure: data.pressure.text,
      humidity: data.humidity,
      nebulosity: data.cloudcover,
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

    const res = await fetch(`http://accuwxandroidv3.accu-weather.com/widget/accuwxandroidv3/weather-data.asp?location=${city}&language=${locale}`)
      .then((r) => r.text())
      .then((data) => parser.parse(data, this.parserOptions).adc_database)
      .catch((error) => {
        this.client.logger.error(`[apis->getForecast] Cannot get current forecast for city ${city} (locale: ${locale})`, error);
        throw new Error('FETCH_ERROR');
      });

    if (!res) return null;

    const forecast = [];

    for (let i = 0; i < res.forecast.day.length; i += 1) {
      const {
        obsdate,
        sunrise,
        sunset,
        daytime,
      } = res.forecast.day[i];
      forecast.push({
        date: moment(obsdate).unix(),
        condition: daytime.txtshort,
        icon: daytime.weathericon < 10 ? `0${daytime.weathericon}` : String(daytime.weathericon),
        temperatures: {
          max: [toCelcius(daytime.hightemperature), daytime.hightemperature],
          min: [toCelcius(daytime.lowtemperature), daytime.lowtemperature],
        },
        wind: {
          direction: daytime.winddirection,
          speed: [toKph(daytime.windspeed), daytime.windspeed],
        },
        gust: [toKph(daytime.windgust), daytime.windgust],
        uvindex: daytime.maxuv,
        nebulosity: daytime.cloudCover,
        sun: [moment(`${obsdate} ${sunrise}`).unix() * 1000, moment(`${obsdate} ${sunset}`).unix() * 1000],
        moon: res.moon.phase.find((p) => p.date === obsdate).text,
      });
    }

    return forecast;
  }
}

module.exports = APIProvider;
