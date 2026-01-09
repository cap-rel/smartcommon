import { floor, isArray, isDate, isNull, isNumber, isObject, isString, values } from "lodash";

export function isLast(value, item) {
  if (isArray(value)) {
    return value[value.length - 1] === item;
  }

  if (isObject(value) && !isNull(value)) {
    const items = values(value);
    return items[items.length - 1] === item;
  }

  if (isNumber(value)) {
    const str = String(value);
    return str[str.length - 1] === String(item);
  }

  if (isString(value)) {
    return value[value.length - 1] === item;
  }

  return false;
}

export function isFirst(value, item) {
  if (isArray(value) || isString(value)) {
    return value[0] === item;
  }

  if (isObject(value) && !isNull(value)) {
    return values(value)[0] === item;
  }

  if (isNumber(value)) {
    return String(value)[0] === String(item);
  }

  return false;
}

export function toSTimestamp(date) {
  return floor((isDate(date) ? date.getTime() : date) / 1000);
}

export function toMsTimestamp(date) {
  return isDate(date) ? date.getTime() : (date * 1000);
}

export function position() {}