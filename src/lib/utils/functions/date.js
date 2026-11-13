/*-----------------  Objet Date  ------------------*/

import { isDate, isNil } from "lodash";

import { secsToDuration } from "lib/utils";

import { DurationFormatter } from "./intl";

// new Date();
// new Date(value);
// new Date(dateString);
// new Date(year, monthIndex);
// new Date(year, monthIndex, day);
// new Date(year, monthIndex, day, hours);
// new Date(year, monthIndex, day, hours, minutes);
// new Date(year, monthIndex, day, hours, minutes, seconds);
// new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds);

// Date.now() => timestamp millisecondes actuel
// Date.parse(dateString) => nombre de millisecondes entre la 1970 et la date
// Date.UTC(year, monthIndex, day, hours, minutes, seconds, milliseconds) => parse() mais en UTC

// getTime() => équivalent à Date.now()
// valueOf() => équivalent à Date.now()

// getMilliseconds() => millisecondes [0 - 999]
// getSeconds() => secondes [0 - 59]
// getMinutes() => minutes [0 - 59]
// getHours() => heure [0 - 23]
// getDay() => jour de la semaine [0 - 6] (dimanche = 0)
// getDate() => jour du mois [1 - 31]
// getMonth() => mois [0 - 11]
// getFullYear() => année (getYear() dépréciée)

// getUTCMilliseconds() => millisecondes UTC [0 - 999]
// getUTCSeconds() => secondes UTC [0 - 59]
// getUTCMinutes() => minutes UTC [0 - 59]
// getUTCHours() => heure UTC [0 - 23]
// getUTCDay() => jour de la semaine UTC [0 - 6] (dimanche = 0)
// getUTCDate() => jour du mois UTC [1 - 31]
// getUTCMonth() => mois UTC [0 - 11]
// getUTCFullYear() => année UTC (getUTCYear() dépréciée)

// set...(value) => js ajuste (ex: setDate(33) sur juillet (31) => 2) (setDay n'existe pas)
// setUTC...(value) => js ajuste (ex: setUTCDate(33) sur juillet (31) => 2) (setUTCDay n'existe pas)

// getTimeZoneOffset() => décalage temporel (minutes) entre local et UTC (ex: UTC+1 => -60, UTC-2 => 120)

// toString() => date (datetime) locale chaîne (ex: Wed Jul 28 1993 14:39:07 GMT+0200 (CEST))
// toDateString() => date locale chaîne (ex: Wed Jul 28 1993)
// toTimeString() => temps local chaîne (ex: 14:39:07 GMT+0200 (CEST))
// toUTCString() => date (datetime) locale chaîne (ex: Wed Jul 28 1993 16:39:07 GMT)
// toJSON() => date JSON toujours en UTC (ex: 1993-07-28T16:39:07.000Z)
// toISOString() => date ISO toujours en UTC (ex: 1993-07-28T16:39:07.000Z)

// toLocalString(locales, options) => date (datetime) locale chaîne
// toLocalDateString(locales, options) => date locale chaîne
// toLocalTimeString(locales, options) => temps local chaîne

/*-----------------  Object Intl  ------------------*/

// Intl.Collator
// Intl.DateTimeFormat
// Intl.DisplayNames
// Intl.DurationFormat
// Intl.ListFormat
// Intl.Locale
// Intl.NumberFormat
// Intl.PluralRules
// Intl.RelativeTimeFormat
// Intl.Segmenter

export function formatDate(date, format) {  
    if (isNil(format)) {
      return date;
    }

    const time      =         date.getTime();

    if (format.toLowerCase() === "milliseconds-timestamp") {
      return time
    }

    if (format.toLowerCase() === "seconds-timestamp") {
      return Math.round(time / 1000);
    }

    const year      =         date.getFullYear()             ;
    const month     = ("0" + (date.getMonth() + 1)).slice(-2);
    const dayNumber = ("0" +  date.getDate()      ).slice(-2);
    const hours     = ("0" +  date.getHours()     ).slice(-2);
    const minutes   = ("0" +  date.getMinutes()   ).slice(-2);
    const seconds   = ("0" +  date.getSeconds()   ).slice(-2);
  
    // 12-hour clock: midnight and noon are both 12.
    const hours12   = ("0" + (date.getHours() % 12 || 12)).slice(-2);

    // One pass over every token, so each occurrence is replaced and a
    // replaced value is never read again as a token.
    const tokens = {
      YYYY: year,
      YY: year.toString().slice(2, 4),
      MM: month,
      DD: dayNumber,
      HH: hours,
      hh: hours12,
      mm: minutes,
      ss: seconds,
    };

    return format.replace(/YYYY|YY|MM|DD|HH|hh|mm|ss/g, token => tokens[token]);
};

// "HH:MM[:SS]" to a number of seconds ("01:02:03" -> 3723), null when the
// text is not a time.
export function formatTime(time) {
  const parts = String(time ?? "").split(":").map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some(part => !Number.isFinite(part))) {
    return null;
  }
  const [hours, minutes, seconds = 0] = parts;

  return hours * 60 * 60 + minutes * 60 + seconds;
}

export function formatDuration(duration) {
  const { days, hours, minutes, seconds } = secsToDuration(duration);

  const formattedDays = days !== 0 ? `${days} jour(s) ` : "";
  const formattedHours = (hours !== 0 || days !== 0) ? `${hours} h ` : "";
  const formattedMinutes = (minutes !== 0 || hours !== 0 || days !== 0) ? `${minutes} min ` : "";
  const formattedSeconds = (seconds !== 0 || minutes !== 0 || hours !== 0 || days !== 0) ? `${seconds} s` : "";

  const formattedDuration = `${formattedDays}${formattedHours}${formattedMinutes}${formattedSeconds}`;

  return formattedDuration;
}

// Seconds to "HH:MM"; hours keep counting past a day (90000 -> "25:00").
export function formatSeconds(seconds) {
  const { days, hours: hoursOfDay, minutes } = secsToDuration(seconds);
  const hours = days * 24 + hoursOfDay;

  const formattedHours = ("0" +  hours).slice(-2);
  const formattedMinutes = ("0" +  minutes).slice(-2);

  return `${formattedHours}:${formattedMinutes}`;
}

export function secondsToDuration(seconds) {
  const secs = seconds % 60;
  const minutes = Math.floor((seconds % 3600) / 60);
  const hours = Math.floor((seconds % 86400) / 3600);
  const days = Math.floor(seconds / 86400);

  return { secs, minutes, hours, days };
}

export function timeToMinutes(time) {
  const [hrs, mins] = time.split(":").map(Number);
  return hrs * 60 + mins;
}

export function minutesToTime(minutes, format = "time") {
  const mins = minutes % 60;
  const hrs = Math.floor((minutes / 60));
  if (format === "time") {
    return `${("0" + hrs).slice(-2)}:${("0" + mins).slice(-2)}`;
  } else if (format === "units") {
    return { hours: hrs, minutes: mins };
  }
}

/**
 * @param {Date} date
 * @param {"date"|"time"} [format] date only, time only, else both
 *
 * @example
 * ISOFormat(new Date(2026, 10, 13, 9, 30));         // "2026-11-13T09:30"
 * ISOFormat(new Date(2026, 10, 13, 9, 30), "date"); // "2026-11-13"
 * ISOFormat(new Date(2026, 10, 13, 9, 30), "time"); // "09:30"
*/
export function ISOFormat(date, format) {
  if (!isDate(date)) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  switch (format) {
    case "date": return `${year}-${month}-${day}`;
    case "time": return `${hours}:${minutes}`;
    default: return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

/**
 * @param {Date} date
 * @param {object} options default => { style: 'medium', timeStyle: 'short' }
 * @param {string} locales default => 'default'
 * 
 * @see for the possible values in options => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * 
 * @example
 * datetimeFormat(new Date(2026, 10, 13, 9, 30), undefined, "fr-FR"); // "13 nov. 2026, 09:30"
*/
export function datetimeFormat(date, options = { dateStyle: 'medium', timeStyle: 'short' }, locales = "default") {
  if (isNil(date) || !isDate(date)) {
    return null;
  }

  return new Intl.DateTimeFormat(locales, options).format(date);
}

/**
 * @param {object} duration
 * @param {object} options default => { style: 'narrow' }
 * @param {string} locales default => 'default'
 * 
 * @see For the possible values in options => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat/DurationFormat
 * 
 * @example
 * durationFormat({ hours: 1, minutes: 30 }, { style: "long" }, "fr"); // "1 heure et 30 minutes"
 * durationFormat({ days: 2 }, undefined, "en");                       // "2d"
*/
export function durationFormat(duration, options = { style: "narrow" }, locales = "default") {
  if (isNil(duration)) {
    return null;
  }

  return DurationFormatter(locales, options).format(duration);
}

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
export function relativeTimeFormat(value, unit, options = {}, locales = "default") {
  if (isNil(value) || isNil(unit)) {
    return null;
  }

  return new Intl.RelativeTimeFormat(locales, options).format(value, unit);
}