import { Button, Spinner } from "lib/components";
import { useEffect } from "react";
import { FaEye, FaEyeSlash, FaMinus, FaPlus } from "react-icons/fa6";
import { isNumber, isNil, isEmpty, includes } from "lodash";

import { applyFunctionIfNotNil, datetimeFormat, timeToMinutes } from "lib/utils";
import { Label } from "lib/components";
import { useStates, useField, useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

// IDEA Types week, month, year
// IDEA Clipboard
// IDEA Random id for label and input

// TODO All steppers
// TODO Stepper

export const Input = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantMerger("Input", props);

  const { 
    id,
    responsive = true,
    name,
    defaultValue,
    value,
    onChange = () => {},
showErrors,

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

  const filteredType = typeMap[type]?.type ?? "text";

  const stringTypes = ["text", "email", "password", "url", "tel", "search"];
  const datetimeTypes = ["date", "datetime-local"];
  const numberTypes = ["number"];
  const timeTypes = ["time"];

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
      condition: includes(numberTypes, filteredType) && isNumber(currentValue),
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

  // const currentValueFormat = {
  //   time: minutesToTime(currentValue)
  // };

  const handleInputOnChange = e => {
    if (!disabled && !readOnly && !isFormSubmitting) {
      let value = e.target.value;

      if (numberTypes.includes(type)) {
        value = Number(value);
      } else if (datetimeTypes.includes(type)) {
        value = (new Date(value)).getTime();
      } else if (timeTypes.includes(type)) {
        value = timeToMinutes(value);
      }

      setValue(value);
    }
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
      showErrors={isFormSubmitted ?? showErrors}
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
            {inputIcon()}
          </div>
        }

        <input { ...mergeProps("input", props => ({
          placeholder, 
          ...props,
          ...mergeQuickProps(["disabled", "readOnly", "name", "size", "onBlur", "onFocus"]),
          className: `outline-hidden min-w-0 grow placeholder-soft-text truncate text-strong-text`,
          onChange: e => {
            handleInputOnChange(e);
            applyFunctionIfNotNil(props.onChange, e);
          },
          value: currentValue,
          type: filteredType
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