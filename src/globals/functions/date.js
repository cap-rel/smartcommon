/*-----------------  Objet Date  ------------------*/

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

