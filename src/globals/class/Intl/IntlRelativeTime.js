import { isArray, isNumber } from "../../functions";
import { isDate } from "../functions";

/**
 * @param {number} value
 * @param {string} unit
 * @param {object} options default = {}
 * @param {string} locales default = 'default'
 * 
 * @see for the possible values in options => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat
 * 
 * @example
 * relativeTimeFormat(2, 'day', {}, 'en'); // In 2 days 
 * relativeTimeFormat(-3, 'hour', {}, 'fr'); // Il y a 3 heures 
*/
export class IntlRelativeTime {
  constructor({
    value,
    unit,
    options,
    locales = "default"
  }) {
    if (!isNumber(value) && !isString(unit)) {
      throw new Error("`value` must be a number and `unit` must be a string.");
    }

    this.date = value;
    this.date = unit;
    this.options = options;
    this.locales = locales;
    this.formatter = new Intl.RelativeTimeFormat(locales, options);
  }

  format() {
    return this.formatter.format(this.value, this.unit);
  }

  formatToParts() {
    return this.formatter.formatToParts(this.value, this.unit);
  }

  resolvedOptions() {
    return this.formatter.resolvedOptions();
  }

  get value() {
    return this.value;
  }

  get unit() {
    return this.unit;
  }
  
  get locales() {
    return this.locales;
  }

  get options() {
    return this.options;
  }
}