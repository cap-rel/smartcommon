import { isDate, isArray } from "lodash";

/**
 * @param {Date} date
 * @param {object} options default => { style: 'medium', timeStyle: 'short' }
 * @param {string} locales default => 'default'
 * 
 * @see for the possible values in options => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * 
 * @example
 * const date1 = { };
 * const date2 = { };
 * 
 * 
 * durationFormat(duration1, {}, 'en'); // In 2 days 
 * durationFormat(duration2, {}, 'fr'); // Il y a 3 heures 
*/
export function DateTimeFormatter(locales = "default", options = { dateStyle: 'medium', timeStyle: 'short' }) {
  const formatter = new Intl.DateTimeFormat(locales, options);

  return {
    format: date => formatter.format(date),
    formatToParts: date => formatter.formatToParts(date),
    formatRange: (startDate, endDate) => formatter.formatRange(startDate, endDate),
    formatRangeToParts: (startDate, endDate) => formatter.formatRangeToParts(startDate, endDate),
    resolvedOptions: () => formatter.resolvedOptions()
  }
}

export function datetimeFormatRange(startDate, startEnd, options = { dateStyle: 'medium', timeStyle: 'short' }, locales = "default") {
  // if (!isArray(date, { length: 2, type: Date })) {
  //   return null;
  // }

  return new Intl.DateTimeFormat(locales, options).formatRange(startDate, startEnd);
}

export class DateTime {
  constructor(
    date,
    options = { dateStyle: "medium", timeStyle: "short" },
    locales = "default"
  ) {
    const isSingleDate = isDate(date);
    const isRange = isArray(date, { length: 2, type: Date });

    if (!isSingleDate && !isRange) {
      throw new Error("`date` must be a Date or a [startDate, endDate] array of Dates.");
    }

    this.date = date;
    this.options = options;
    this.locales = locales;
    this.formatter = new Intl.DateTimeFormat(locales, options);
    this.isRange = isRange;
  }

  format() {
    if (this.isRange) {
      return this.formatter.formatRange(this.date[0], this.date[1]);
    }
    return this.formatter.format(this.date);
  }

  formatToParts() {
    if (this.isRange) {
        return this.formatter.formatRangeToParts(this.date[0], this.date[1]);
    }
    return this.formatter.formatToParts(this.date);
  }

  resolvedOptions() {
    return this.formatter.resolvedOptions();
  }

  get date() {
    return this.isRange ? this.date[0] : this.date;
  }

  get startDate() {
    return this.isRange ? this.date[0] : this.date;
  }

  get endDate() {
    return this.isRange ? this.date[1] : null;
  }

  get locales() {
    return this.locales;
  }

  get options() {
    return this.options;
  }
}