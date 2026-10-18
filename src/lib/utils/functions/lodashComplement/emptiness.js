import { isEmpty, isNil, isNumber } from "lodash";

// "Has the user provided a value?" for form validation. lodash's isEmpty is
// about collections: isEmpty(42) and isEmpty(true) are both true, which made
// every `required` rule fail on numeric, date (timestamp) or boolean values.
// Here a number is empty only when NaN, a boolean never is, strings, arrays
// and objects follow isEmpty.
export const isEmptyValue = (value) => {
    if (isNil(value)) return true;
    if (isNumber(value)) return globalThis.Number.isNaN(value);
    if (typeof value === "boolean") return false;
    return isEmpty(value);
};
