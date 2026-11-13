/**
 * @param {string} locales default => 'default'
 * @param {object} options default => { dateStyle: 'medium', timeStyle: 'short' }
 *
 * @see for the possible values in options => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 *
 * @example
 * DateTimeFormatter("fr-FR").format(new Date(2026, 10, 13, 9, 30)); // "13 nov. 2026, 09:30"
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

const DURATION_UNITS = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"];

// Intl.DateTimeFormat accepts "default", Intl.DurationFormat does not.
const toIntlLocale = (locales) => (locales === "default" ? undefined : locales);

/**
 * Formats durations ({ hours: 1, minutes: 30 }), through Intl.DurationFormat
 * when the browser has it, else unit by unit through Intl.NumberFormat.
 *
 * @param {string} locales default => 'default' (browser language)
 * @param {object} options default => { style: 'narrow' } ("long", "short" or "narrow")
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/DurationFormat
 *
 * @example
 * DurationFormatter("fr", { style: "long" }).format({ hours: 1, minutes: 30 }); // "1 heure et 30 minutes"
 * DurationFormatter("en").format({ hours: 2 }); // "2h"
*/
export function DurationFormatter(locales = "default", options = { style: "narrow" }) {
  const locale = toIntlLocale(locales);

  if (typeof Intl.DurationFormat === "function") {
    const formatter = new Intl.DurationFormat(locale, options);
    return {
      format: duration => formatter.format(duration),
      formatToParts: duration => formatter.formatToParts(duration),
      resolvedOptions: () => formatter.resolvedOptions(),
    };
  }

  // Fallback (Firefox before 136, older WebViews): each non-zero unit is
  // formatted on its own, then they are joined.
  const style = options?.style ?? "narrow";
  const unitDisplay = style === "long" ? "long" : style === "short" ? "short" : "narrow";
  const formatUnit = (unit, value) => new Intl.NumberFormat(locale, {
    style: "unit",
    unit: unit.slice(0, -1),
    unitDisplay,
  }).format(value);

  const format = (duration = {}) => {
    const parts = DURATION_UNITS
      .filter(unit => Number(duration?.[unit]))
      .map(unit => formatUnit(unit, Number(duration[unit])));
    return parts.length > 0 ? parts.join(" ") : formatUnit("seconds", 0);
  };

  return {
    format,
    formatToParts: duration => [{ type: "literal", value: format(duration) }],
    resolvedOptions: () => ({ locale: new Intl.NumberFormat(locale).resolvedOptions().locale, style }),
  };
}
