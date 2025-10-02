/**
 * @param {string} locales default => 'default'
 * @param {object} options default => { style: 'medium', timeStyle: 'short' }
 * 
 * @see for the possible values in options => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * 
 * @example
 * const date1 = { };
 * const date2 = { };
 * 
 * DateTimeFormatter().format(date1)
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

/**
 * @param {string} locales default => 'default'
 * @param {object} options default => { style: 'medium', timeStyle: 'short' }
 * 
 * @see for the possible values in options => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * 
 * @example
 * const date1 = { };
 * const date2 = { };
 * 
 * DateTimeFormatter().format(date1)
 * 
 * durationFormat(duration1, {}, 'en'); // In 2 days 
 * durationFormat(duration2, {}, 'fr'); // Il y a 3 heures 
*/
export function DurationFormatter(locales = "default", options = { style: "narrow" }) {
  const formatter = new Intl.DateTimeFormat(locales, options);

  return {
    format: date => formatter.format(date),
    formatToParts: date => formatter.formatToParts(date),
    formatRange: (startDate, endDate) => formatter.formatRange(startDate, endDate),
    formatRangeToParts: (startDate, endDate) => formatter.formatRangeToParts(startDate, endDate),
    resolvedOptions: () => formatter.resolvedOptions()
  }
}