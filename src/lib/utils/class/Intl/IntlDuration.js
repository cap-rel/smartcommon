import { isObject } from "src/utils";

export class IntlDuration {
  constructor({
    duration,
    options = { style: "narrow" },
    locales = "default"
  }) {

    if (!isObject(duration)) {
      throw new Error("`duration` must be an object ({ ..., hours, minutes, seconds, ... })");
    }

    this.duration = duration;
    this.options = options;
    this.locales = locales;
    this.formatter = new Intl.DurationFormat(locales, options);
  }

  format() {
    return this.formatter.format(this.duration);
  }

  formatToParts() {
    return this.formatter.formatToParts(this.duration);
  }

  resolvedOptions() {
    return this.formatter.resolvedOptions();
  }

  get duration() {
    return this.duration;
  }

  get locales() {
    return this.locales;
  }

  get options() {
    return this.options;
  }
}