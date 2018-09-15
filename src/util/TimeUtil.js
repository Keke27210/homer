const XRegExp = require('xregexp');

class TimeUtil {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client, enumerable: false });
    this.default = this.client.localization.defaultLocale;
  }

  timeSince(time, locale = 'en-gb', short = false, ago = false) {
    const string = [];
    let seconds = Math.abs((Date.now() - time) / 1000);

    const years = Math.floor(seconds / (60 * 60 * 24 * 365));
    if (years > 0) {
      string.push(`**${years}**${this.client.__(locale, `timeUtil.timeSince.years.${short ? 'short' : 'long'}.${years > 1 ? 'p' : 's'}`)}`);
      seconds %= (60 * 60 * 24 * 365);
    }

    const weeks = Math.floor(seconds / (60 * 60 * 24 * 7));
    if (weeks > 0) {
      string.push(`**${weeks}**${this.client.__(locale, `timeUtil.timeSince.weeks.${short ? 'short' : 'long'}.${years > 1 ? 'p' : 's'}`)}`);
      seconds %= (60 * 60 * 24 * 7);
    }

    const days = Math.floor(seconds / (60 * 60 * 24));
    if (days > 0) {
      string.push(`**${days}**${this.client.__(locale, `timeUtil.timeSince.days.${short ? 'short' : 'long'}.${years > 1 ? 'p' : 's'}`)}`);
      seconds %= (60 * 60 * 24);
    }

    const hours = Math.floor(seconds / (60 * 60));
    if (hours > 0) {
      string.push(`**${hours}**${this.client.__(locale, `timeUtil.timeSince.hours.${short ? 'short' : 'long'}.${years > 1 ? 'p' : 's'}`)}`);
      seconds %= (60 * 60);
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      string.push(`**${minutes}**${this.client.__(locale, `timeUtil.timeSince.minutes.${short ? 'short' : 'long'}`)}`);
      seconds %= 60;
    }

    if (Math.floor(seconds) > 0) {
      string.push(`**${Math.floor(seconds)}**${this.client.__(locale, `timeUtil.timeSince.seconds.${short ? 'short' : 'long'}`)}`);
    }

    if (string.length > 0) {
      let timeStr = string.join(', ');
      const andIndex = timeStr.lastIndexOf(', ');
      if (andIndex !== -1) timeStr = timeStr.substring(0, andIndex) + ` ${this.client.__(locale, 'global.and')} ` + timeStr.substring(andIndex + 2);
      return (ago ? this.client.__(locale, 'timeUtil.timeSince.ago', { time: timeStr }) : timeStr);
    }

    return this.client.__(locale, 'timeUtil.timeSince.noTime');
  }

  parseDuration(string, locale = 'en-gb') {
    const matches = [
      [this.client.__(this.default, 'timeUtil.timeSince.seconds.short'), this.client.__(locale, 'timeUtil.timeSince.seconds.short')],
      [this.client.__(this.default, 'timeUtil.timeSince.minutes.short'), this.client.__(locale, 'timeUtil.timeSince.minutes.short')],
      [this.client.__(this.default, 'timeUtil.timeSince.hours.short'), this.client.__(locale, 'timeUtil.timeSince.hours.short')],
      [this.client.__(this.default, 'timeUtil.timeSince.days.short'), this.client.__(locale, 'timeUtil.timeSince.days.short')],
      [this.client.__(this.default, 'timeUtil.timeSince.weeks.short'), this.client.__(locale, 'timeUtil.timeSince.weeks.short')],
      [this.client.__(this.default, 'timeUtil.timeSince.years.short'), this.client.__(locale, 'timeUtil.timeSince.years.short')],
    ];

    string = string
      .replace(new XRegExp('(?i)(\\s|,|and)', 'g'), '')
      .replace(new XRegExp('(?is)(-?\\d+|[a-z]+)', 'g'), (group, s1) => `${s1} `)
      .trim();

    const vals = string.split(new RegExp('\\s+'));
    let time = 0;

    try {
      for (let i = 0; i < vals.length; i += 2) {
        let num = parseInt(vals[i]);
        if (matches[1].find(a => a.startsWith(vals[i + 1].toLowerCase()))) {
          num *= 60;
        } else if (matches[2].find(a => a.startsWith(vals[i + 1].toLowerCase()))) {
          num *= (60 * 60);
        } else if (matches[3].find(a => a.startsWith(vals[i + 1].toLowerCase()))) {
          num *= (60 * 60 * 24);
        } else if (matches[4].find(a => a.startsWith(vals[i + 1].toLowerCase()))) {
          num *= (60 * 60 * 24 * 7);
        } else if (matches[5].find(a => a.startsWith(vals[i + 1].toLowerCase()))) {
          num *= (60 * 60 * 24 * 365);
        }

        time += num;
      }
    } catch (e) {
      return 0;
    }

    return (time * 1000);
  }
}

module.exports = TimeUtil;
