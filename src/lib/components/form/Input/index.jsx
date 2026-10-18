import { Button, Spinner } from "lib/components";
import { useEffect, useId } from "react";
import { FaEye, FaEyeSlash, FaMinus, FaPlus } from "react-icons/fa6";
import { isNumber, isNil, includes } from "lodash";

import { applyFunctionIfNotNil, datetimeFormat, ISOFormat, timeToMinutes, minutesToTime, isEmptyValue } from "lib/utils";
import { Label } from "lib/components";
import { useStates, useField, useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes, DEFAULT_LABELS } from "./props";

// IDEA Types week, month, year
// IDEA Clipboard
// IDEA Random id for label and input

// TODO All steppers
// TODO Stepper

// Static type buckets: hoisted to module scope so they are not re-created on
// every render. They classify the *resolved* HTML input type (filteredType).
const STRING_TYPES = ["text", "email", "password", "url", "tel", "search"];
const DATETIME_TYPES = ["date", "datetime-local"];
const NUMBER_TYPES = ["number"];
const TIME_TYPES = ["time"];

// Native HTML input types accepted as-is when no meta-type matches. This lets a
// consumer pass a real HTML type ("datetime-local", "date", "number", ...) and
// still get the native widget instead of silently falling back to "text".
const NATIVE_HTML_TYPES = [
  ...STRING_TYPES,
  ...DATETIME_TYPES,
  ...NUMBER_TYPES,
  ...TIME_TYPES,
  "color",
  "month",
  "week",
  "range",
  "hidden",
];

export const Input = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("Input", props);

  const {
    id,
    label,
    responsive = true,
    name,
    defaultValue,
    value,
    onChange = () => {},


    required = false,
    disabled = false,
    readOnly = false,

    type = "text",
    min,
    max,
    minLength,
    length,
    maxLength,
    pattern,
    patternError,

    loading = false,
    inputIcon,
    size,
    placeholder,
    step,
    inputMode,
    labels: userLabels = {},
  } = variantProps;

  const labels = { ...DEFAULT_LABELS, ...userLabels };

  // Stable id to wire the <label htmlFor> to the <input id>. Falls back to a
  // generated id so the association works even when the consumer passes none.
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const initialStates = {
    isPasswordVisible: false,
    // isCopied: false
  };

  const { states, set } = useStates({ initialStates, debug: false });

  const { isPasswordVisible } = states; // isCopied

  const typeMap = {
    varchar: { type: "text" },
    email: { type: "email" },
    password : { type: isPasswordVisible ? "text" : "password" },
    phoneNumber: { type: "tel" },
    int: { type: "number" },
    float: { type: "number" },
    double: { type: "number" },
    search: { type: "search" },
    url: { type: "url" },
    ip: { type: "text" },
    timestamp: { type: "number" },
    date: { type: "date" },
    datetime: { type: "datetime-local" },
    time: { type: "time" },
  };

  // Resolution order: meta-type map first, then native HTML pass-through, then
  // "text" as a last resort. The pass-through is what makes type="datetime-local"
  // (and friends) activate the native widget.
  const filteredType = typeMap[type]?.type ?? (includes(NATIVE_HTML_TYPES, type) ? type : "text");

  const isStringType = includes(STRING_TYPES, filteredType);
  const isDateType = includes(DATETIME_TYPES, filteredType);
  const isTimeType = includes(TIME_TYPES, filteredType);
  const hasBounds = includes(NUMBER_TYPES, filteredType) || isDateType || isTimeType;

  // A string pattern follows the HTML attribute semantics (whole value must
  // match); a RegExp is used as given, minus the stateful g / y flags.
  const patternRegExp = isNil(pattern)
    ? undefined
    : typeof pattern === "string"
      ? new RegExp(`^(?:${pattern})$`)
      : new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""));

  const boundLabel = (side) => {
    const key = isDateType ? `${side}DateError` : isTimeType ? `${side}TimeError` : `${side}Error`;
    return labels[key];
  };

  // Human readable bound for the error message.
  const formatBound = (bound) => {
    if (isNil(bound)) return "";
    if (filteredType === "date") return datetimeFormat(new Date(bound), { dateStyle: "short", timeZone: "UTC" });
    if (isDateType) return datetimeFormat(new Date(bound), { dateStyle: "short", timeStyle: "short" });
    if (isTimeType) return minutesToTime(bound);
    return globalThis.String(bound);
  };

  // Bound in the string format the native input expects (min / max
  // attributes drive the native pickers and spinners).
  const toNativeBound = (bound) => {
    if (isNil(bound) || !hasBounds) return undefined;
    if (filteredType === "date") return new Date(bound).toISOString().split("T")[0];
    if (isDateType) return ISOFormat(new Date(bound));
    if (isTimeType) return minutesToTime(bound);
    return bound;
  };

  const errors = (currentValue) => ({
    // email: { 
    //   condition: type === "email" && !yup.email().isValidSync(currentValue),
    //   message: "Veuillez rentrer une addresse email valide." 
    // },
    // tel: { 
    //   condition: type === "email" && !yup.email().isValidSync(currentValue),
    //   message: "Ce champ est requis." 
    // },
    // url: {
    //   condition: required && isEmptyValue(currentValue),
    //   message: "Ce champ est requis." 
    // },

    number: { 
      // Error when a non-empty value is not a finite number (the rule used to
      // fire on every valid number).
      condition: includes(NUMBER_TYPES, filteredType) && !isEmptyValue(currentValue) && !globalThis.Number.isFinite(globalThis.Number(currentValue)),
      message: labels.numberError 
    },
    required: { 
      condition: required && isEmptyValue(currentValue),
      message: labels.requiredError 
    },

    // Bounds use the unit of the emitted value: the number itself for
    // number inputs, a ms timestamp for date / datetime-local, minutes since
    // midnight for time. Empty values are left to the `required` rule.
    min: {
      condition: hasBounds && !isNil(min) && !isEmptyValue(currentValue) && globalThis.Number(currentValue) < min,
      message: boundLabel("min")(formatBound(min)),
    },
    max: {
      condition: hasBounds && !isNil(max) && !isEmptyValue(currentValue) && globalThis.Number(currentValue) > max,
      message: boundLabel("max")(formatBound(max)),
    },
    minLength: {
      condition: isStringType && !isNil(minLength) && !isEmptyValue(currentValue) && globalThis.String(currentValue).length < minLength,
      message: labels.minLengthError(minLength),
    },
    length: {
      condition: isStringType && !isNil(length) && !isEmptyValue(currentValue) && globalThis.String(currentValue).length !== length,
      message: labels.lengthError(length),
    },
    maxLength: {
      condition: isStringType && !isNil(maxLength) && !isEmptyValue(currentValue) && globalThis.String(currentValue).length > maxLength,
      message: labels.maxLengthError(maxLength),
    },
    pattern: {
      condition: isStringType && !isNil(patternRegExp) && !isEmptyValue(currentValue) && !patternRegExp.test(globalThis.String(currentValue)),
      message: patternError ?? labels.patternError,
    },
  });

  const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors, formSubmitted: variantProps.formSubmitted, onError: variantProps.onError });

  // Format the value for display in the input element
  // Timestamps need to be converted back to the format expected by HTML inputs
  const getDisplayValue = () => {
    if (isNil(currentValue) || currentValue === "") return "";

    if (DATETIME_TYPES.includes(filteredType) && isNumber(currentValue)) {
      // Convert timestamp to date string (yyyy-MM-dd or yyyy-MM-ddTHH:mm)
      const date = new Date(currentValue);
      if (isNaN(date.getTime())) return "";

      if (filteredType === "date") {
        return date.toISOString().split("T")[0]; // yyyy-MM-dd
      } else {
        // datetime-local format: yyyy-MM-ddTHH:mm, in LOCAL time: the change
        // handler parses the typed value as local time, so formatting in UTC
        // (toISOString) shifted the displayed hour by the timezone offset.
        return ISOFormat(date);
      }
    }

    if (TIME_TYPES.includes(filteredType) && isNumber(currentValue)) {
      // Convert minutes to time string (HH:mm)
      return minutesToTime(currentValue);
    }

    return currentValue;
  };

  // Returns the parsed value AND updates internal form state. Splitting this
  // out lets us pass the parsed value (not the SyntheticEvent) to the
  // consumer's onChange, matching the documented contract:
  //   "Les composants Input et Select passent la valeur directement, pas un
  //    event DOM."  (SMARTMAKER.md, anti-pattern 2)
  const handleInputOnChange = e => {
    if (disabled || readOnly || isFormSubmitting) return undefined;

    let value = e.target.value;

    const isParsedType = NUMBER_TYPES.includes(filteredType)
      || DATETIME_TYPES.includes(filteredType)
      || TIME_TYPES.includes(filteredType);

    if (isParsedType && value === "") {
      // A cleared number/date/time field is empty (null), not 0 / NaN:
      // Number("") is 0, which made a required field look filled.
      value = null;
    } else if (NUMBER_TYPES.includes(filteredType)) {
      value = Number(value);
    } else if (DATETIME_TYPES.includes(filteredType)) {
      value = (new Date(value)).getTime();
    } else if (TIME_TYPES.includes(filteredType)) {
      value = timeToMinutes(value);
    }

    setValue(value);
    return value;
  };

  const removeStep = () => setValue(Number(currentValue) - step);
  const addStep = () => setValue(Number(currentValue) + step);
  const togglePasswordVisibility = () => set("isPasswordVisible", !isPasswordVisible);
  // const resetCopyButton = () => set("isCopied", false);

  // const copy = () => {
  //   navigator.clipboard.writeText(currentValue)
  //     .then(() => {
  //       set("isCopied", true);
  //       toast("Copié dans le presse-papier")
  //     })
  //     .catch(() => toast.error("La copie a échouée, probablement non disponible sur votre navigateur"));
  // };

  const isPassword = type === "password";

  return (

    <Label
      { ...variantProps}
      id={inputId}
      showErrors={isFormSubmitted}
      errors={filteredErrors}
      mergeProps={mergeProps}
    >
      <div { ...mergeProps("inputContainer", props => ({
        ...props,
        className: `min-w-0 flex items-center rounded-app-md 
          p-app-xs gap-app-xs bg-soft-bg border-border border duration-(--instant)
          has-[input:focus]:ring-primary has-[input:focus]:border-primary has-[input:focus]:ring-1 
          has-[input:disabled]:brightness-soft w-full
        `
        // has-[input:invalid]:ring-1 has-[input:invalid]:ring-error has-[input:invalid]:border-error 
      }))}>        
        {loading &&
          <Spinner { ...mergeProps("Spinner", props => props)} />
        }

        {(inputIcon && !loading) &&
          <div { ...mergeProps("inputIcon", props => ({
            "aria-hidden": "true",
            ...props,
            className: `shrink-0 text-soft-text`
          }))}>
            {typeof inputIcon === 'function' ? inputIcon() : inputIcon}
          </div>
        }

        <input { ...mergeProps("input", props => ({
          placeholder,
          // Without a visible label the field has no accessible name, so fall
          // back to the placeholder. A consumer-provided aria-label (via
          // inputProps) still wins thanks to the `...props` spread below.
          "aria-label": label ? undefined : placeholder,
          ...props,
          ...mergeQuickProps(props, ["disabled", "readOnly", "name", "size", "onBlur", "onFocus", "inputMode"]),
          min: props.min ?? toNativeBound(min),
          max: props.max ?? toNativeBound(max),
          // Native hard limit while typing (string types only).
          maxLength: props.maxLength ?? (isStringType ? maxLength : undefined),
          pattern: props.pattern ?? (isStringType && typeof pattern === "string" ? pattern : undefined),
          id: inputId,
          className: `outline-hidden min-w-0 grow placeholder-soft-text truncate text-strong-text`,
          onChange: e => {
            // handleInputOnChange returns the *parsed* value (number/date/
            // string) so we forward that to the consumer instead of the raw
            // SyntheticEvent. Backward compat: anything that read e.target
            // before is rare in practice; the documented contract was always
            // "value directly". See SMARTMAKER.md anti-pattern 2.
            const parsedValue = handleInputOnChange(e);
            applyFunctionIfNotNil(props.onChange, parsedValue);
          },
          value: getDisplayValue(),
          type: props.type || filteredType
        }))} />

        {!isNil(step) &&
          <>
            <Button { ...mergeProps("MinusButton", props => ({
              icon: FaMinus,
              ...props,
              disabled: disabled,
              onClick: e => {
                e.preventDefault();
                removeStep(e)
                applyFunctionIfNotNil(props.onClick, e);
              },
              buttonProps: {
                "aria-label": "Diminuer",
                ...props.buttonProps,
                className: `p-0 bg-transparent text-soft-text`
              }
            }))} />
            <Button { ...mergeProps("PlusButton", props => ({
              icon: FaPlus,
              ...props,
              disabled: disabled,
              onClick: e => {
                e.preventDefault();
                addStep(e)
                applyFunctionIfNotNil(props.onClick, e);
              },
              buttonProps: {
                "aria-label": "Augmenter",
                ...props.buttonProps,
                className: `p-0 bg-transparent text-soft-text`
              }
            }))} />
          </>
        }

        {isPassword &&
          <Button { ...mergeProps("PasswordButton", props => ({
            icon: isPasswordVisible ? FaEyeSlash : FaEye,
            ...props,
            disabled: disabled,
            onClick: e => {
              e.preventDefault();
              togglePasswordVisibility(e)
              applyFunctionIfNotNil(props.onClick, e);
            },
            buttonProps: {
              "aria-label": isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe",
              ...props.buttonProps,
              className: `p-0 bg-transparent text-soft-text`
            }
          }))} />
        }

        {/* {hasCopyButton &&
          <Button { ...mergeProps("CopyButton", props => ({
            icon: isCopied ? <FaClipboardCheck /> : <FaRegClipboard />,
            ...props,
            disabled: disabled,
            onClick: e => {
              e.preventDefault();
              copy(e)
              applyFunctionIfNotNil(props.onClick ?? props.buttonProps?.onClick, e);
            },
            onBlur: e => {
              resetCopyButton(e);
              applyFunctionIfNotNil(props.onBlur, props.buttonProps?.onBlur, e);
            },            
            buttonProps: {
              ...props.buttonProps,
              className: `p-0 bg-transparent ${isCopied ? "text-primary" : "text-soft-text"}`
            }
          }))} />
        } */}
      </div>
    </Label>
  )
};

Input.propTypes = propTypes;
Input.defaultProps = defaultProps