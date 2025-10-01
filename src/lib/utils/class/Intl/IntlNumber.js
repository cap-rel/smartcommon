import { isArray, isNumber } from "../../functions";
import { isDate } from "../functions";

export class IntlNumber {
  constructor({
    number,
    options = { dateStyle: "medium", timeStyle: "short" },
    locales = "default"
  }) {
    const isSingleNumber = isNumber(number);
    const isRange = isArray(number, { length: 2, type: "number" });

    if (!isSingleNumber && !isRange) {
      throw new Error("`number` must be a number or a [startNumber, endNumber] array of numbers.");
    }

    this.number = number;
    this.options = options;
    this.locales = locales;
    this.formatter = new Intl.NumberFormat(locales, options);
    this.isRange = isRange;
  }

  format() {
    if (this.isRange) {
      return this.formatter.formatRange(this.number[0], this.number[1]);
    }
    return this.formatter.format(this.number);
  }

  formatToParts() {
    if (this.isRange) {
        return this.formatter.formatRangeToParts(this.number[0], this.number[1]);
    }
    return this.formatter.formatToParts(this.number);
  }

  resolvedOptions() {
    return this.formatter.resolvedOptions();
  }

  get number() {
    return this.isRange ? this.number[0] : this.number;
  }

  get startNumber() {
    return this.isRange ? this.number[0] : this.number;
  }

  get endNumber() {
    return this.isRange ? this.number[1] : null;
  }

  get locales() {
    return this.locales;
  }

  get options() {
    return this.options;
  }
}