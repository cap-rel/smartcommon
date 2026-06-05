import { Button, Spinner } from "lib/components";
import { useEffect } from "react";
import { FaEye, FaEyeSlash, FaMinus, FaPlus } from "react-icons/fa6";
import { isNumber, isNil, isEmpty, includes } from "lodash";

import { applyFunctionIfNotNil, datetimeFormat, timeToMinutes, minutesToTime } from "lib/utils";
import { Label } from "lib/components";
import { useStates, useField, useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

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
    responsive = true,
    name,
    defaultValue,
    value,
    onChange = () => {},


    required = false,
    disabled = false,
    readOnly = false,

    type = "text",
    min = 0,
    max,
    minLength = 0,
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
  } = variantProps;

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
    //   condition: required && isEmpty(currentValue),
    //   message: "Ce champ est requis." 
    // },

    number: { 
      condition: includes(NUMBER_TYPES, filteredType) && isNumber(currentValue),
      message: "Veuillez rentrer un nombre valide." 
    },
    required: { 
      condition: required && isEmpty(currentValue),
      message: "Ce champ est requis." 
    },

    // minTime: { 
    //   condition: !isNil(min) && timeTypes.includes(type) && currentValue < min,
    //   message: `L'heure doit être après ${datetimeFormat((new Date().setHours(minutesToTime(min ?? 0, "units").hours, minutesToTime(min ?? 0, "units").minutes)), { timeStyle: "short" })}.`
    // },
    // maxTime: {
    //   condition: !isNil(max) && timeTypes.includes(type) && currentValue > max,
    //   message: `L'heure doit être avant ${datetimeFormat((new Date()).setHours(minutesToTime(max ?? 0, "units").hours, minutesToTime(max ?? 0, "units").minutes)), { timeStyle: "short" })}.`
    // },

    // minDateTime: { 
    //   condition: !isNil(min) && datetimeTypes.includes(type) && currentValue < min,
    //   message: `La date doit être après ${datetimeFormat(!isNil(min) ? min * 1000 : 0, { dateStyle: "short", timeStyle: type === "datetime" ? "short" : undefined })}.`
    // },
    // maxDatetime: { 
    //   condition: !isNil(max) && datetimeTypes.includes(type) && currentValue > max,
    //   message: `La date doit être avant ${datetimeFormat(!isNil(max) ? max * 1000 : 0, { dateStyle: "short", timeStyle: type === "datetime" ? "short" : undefined })}.`
    // },
    // minNumber: { 
    //   condition: !isNil(min) && numberTypes.includes(type) && currentValue < min,
    //   message: `La valeur doit être de ${min} minimum.`
    // },
    // maxNumber: { 
    //   condition: !isNil(max) && numberTypes.includes(type) && currentValue > max,
    //   message: `La valeur doit être de ${max} maximum.`
    // },
    // minLength: { 
    //   condition: !isNil(minLength) && stringTypes.includes(type) && currentValue?.length < minLength,
    //   message: `La longueur doit être de ${minLength} caractères au minimum.`
    // },
    // length: { 
    //   condition: !isNil(length) && stringTypes.includes(type) && currentValue?.length !== length,
    //   message: `La longueur doit être de ${length} caractères exactement.`
    // },
    // maxLength: { 
    //   condition: !isNil(maxLength) && stringTypes.includes(type) && currentValue?.length > maxLength,
    //   message: `La valeur doit être de ${maxLength} au maximum.`
    // },
    // pattern: { 
    //   condition: !isNil(pattern) && stringTypes.includes(type) && !pattern.test(currentValue),
    //   message: patternError 
    // },
  });

  const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

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
        // datetime-local format: yyyy-MM-ddTHH:mm
        return date.toISOString().slice(0, 16);
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

    if (NUMBER_TYPES.includes(filteredType)) {
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
            ...props,
            className: `shrink-0 text-soft-text`
          }))}>
            {typeof inputIcon === 'function' ? inputIcon() : inputIcon}
          </div>
        }

        <input { ...mergeProps("input", props => ({
          placeholder,
          ...props,
          ...mergeQuickProps(["disabled", "readOnly", "name", "size", "onBlur", "onFocus"]),
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