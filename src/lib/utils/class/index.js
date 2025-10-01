import { isArray } from "../functions";
import { isDate } from "../functions";

export class IntlDatetime {
  constructor({
    date,
    options = { dateStyle: "medium", timeStyle: "short" },
    locales = "default"
  }) {
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