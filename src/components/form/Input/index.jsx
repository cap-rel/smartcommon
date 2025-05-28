import { applyFunctionIfNotNil, formatDate, formatSeconds, formatTime, isEmpty, isNil, isNumber, secsToDuration } from "../../../globals/functions";
import { Label } from "../../form";
import { useStates, useValue, useLabel, useVariantToProps } from "../../../hooks";
import { twMerge } from "tailwind-merge";
import { FaClipboardCheck, FaEye, FaEyeSlash, FaMinus, FaPlus, FaRegClipboard } from "react-icons/fa6";

import { propTypes } from "./props";

import toast from "react-hot-toast";
import { Button, Spinner } from "../../others";
import { useEffect } from "react";
import * as yup from "yup";

// IDEA Prefix / suffix
// IDEA Select (phone, ...)
// IDEA Default pattern, min, length, ...
// IDEA Default Icons
// IDEA Types week, month, year
// IDEA Clipboard
// IDEA Random id for label and input

// TODO All steppers
// TODO Stepper
// TODO Timer
// TODO Maybe give props for password icons
// TODO Change type attribute

export const Input = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Input", props);

  const { 
    id,
    name,
    defaultValue,
    value,
    onChange = () => {},

    required,
    disabled,
    readOnly,

    type = "text",
    min,
    max,
    minLength,
    length,
    maxLength,
    pattern,
    patternError,

    loading,
    inputIcon,
    size,
    placeholder,
    step,
    inputMode,

    onError = () => {}
  } = variantProps;

  const { states, set } = useStates({
    isPasswordVisible: false,
    // isCopied: false
  });

  const { isPasswordVisible } = states; // isCopied

  const { currentValue, setValue } = useValue(defaultValue, value, onChange);

  const stringTypes = ["text", "email", "password", "url", "tel", "search"];
  const timestampTypes = ["date", "datetime-local"];
  const numberTypes = ["number"];
  const secondsTypes = ["time"];

  const handleInputOnChange = e => {
    let value = e.target.value;
    if (!disabled && !readOnly) {
      if (numberTypes.includes(type)) {
        value = Number(value);
      } else if (timestampTypes.includes(type)) {
        value = formatDate(new Date(value), "seconds-timestamp");
      } else if (secondsTypes.includes(type)) {
        value = formatTime(`${value}:00`);
      }
      setValue(value);
    }
  };

  // const setValueVerifyingMinMax = (newValue) => {
  //   if (newValue >= min && newValue <= max) {
  //     setValue(newValue);
  //   } else {
  //     toast(`${label ? `${label} doit` : "Doit"} être compris entre ${min} et ${max}...`)
  //   }
  // }

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

  const typeMap = {
    "text": { type: "text" },
    "email": { type: "text", inputMode: "email" },
    "password" : { type: isPasswordVisible ? "text" : "password" },
    "tel": { type: "text", inputMode: "tel" },
    "number": { type: "number" },
    "search": { type: "text", inputMode: "search" },
    "url": { type: "text", inputMode: "url" },
    "date": { type: "date" },
    "datetime-local": { type: "datetime-local" },
    "time": { type: "time" },
  };

  const errors = {
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
      condition: type === "number" && isNumber(currentValue),
      message: "Veuillez rentrer un nombre valide." 
    },
    required: { 
      condition: required && isEmpty(currentValue),
      message: "Ce champ est requis." 
    },
    minSeconds: { 
      condition: secondsTypes.includes(type) && currentValue < min,
      message: `L'heure doit être après ${formatSeconds(min)}:.`
    },
    maxSeconds: { 
      condition: secondsTypes.includes(type) && currentValue > max,
      message: `L'heure doit être avant ${formatSeconds(max)}.`
    },
    minTimestamp: { 
      condition: timestampTypes.includes(type) && currentValue < min,
      message: `La date doit être après ${new Intl.DateTimeFormat("default", {}).format(new Date(min))}.`
    },
    maxTimestamp: { 
      condition: timestampTypes.includes(type) && currentValue > max,
      message: `La date doit être avant ${formatDate(new Date(max), "DD/MM/YYYY HH:mm")}.`
    },
    minNumber: { 
      condition: numberTypes.includes(type) && currentValue < min,
      message: `La valeur doit être de ${min} minimum.`
    },
    maxNumber: { 
      condition: numberTypes.includes(type) && currentValue > max,
      message: `La valeur doit être de ${max} maximum.`
    },
    minLength: { 
      condition: !isNil(minLength) && stringTypes.includes(type) && currentValue?.length < minLength,
      message: `La longueur doit être de ${minLength} caractères au minimum.`
    },
    length: { 
      condition: !isNil(length) && stringTypes.includes(type) && currentValue?.length !== length,
      message: `La longueur doit être de ${length} caractères exactement.`
    },
    maxLength: { 
      condition: !isNil(maxLength) && stringTypes.includes(type) && currentValue?.length > maxLength,
      message: `La valeur doit être de ${maxLength} au maximum.`
    },
    pattern: { 
      condition: !isNil(pattern) && stringTypes.includes(type) && !pattern.test(currentValue),
      message: patternError 
    },
  };

  useEffect(() => {
    Object.entries(errors).forEach(([errorKey, error]) => onError(`${id}-${errorKey}`, error.condition))
  }, [currentValue]);

  return (

    <Label 
      { ...variantProps}
      errors={errors}
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

        {(!isNil(inputIcon) && !loading) &&
          <div { ...mergeProps("inputIcon", props => ({
            ...props,
            className: `shrink-0 text-soft-text`
          }))}>
            {inputIcon}
          </div>
        }

        <input { ...mergeProps("input", props => ({
          ...props,
          ...mergeQuickProps(["placeholder", "disabled", "readOnly", "name", "size", "onBlur", "onFocus"]),
          className: `outline-hidden min-w-0 grow placeholder-soft-text truncate text-strong-text`,
          onChange: e => {
            handleInputOnChange(e);
            applyFunctionIfNotNil(props.onChange, e);
          },
          value: currentValue,
          ...typeMap[type] ?? {},
        }))} />

        {!isNil(step) &&
          <>
            <Button { ...mergeProps("MinusButton", props => ({
              icon: <FaMinus />,
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
              icon: <FaPlus />,
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
            icon: isPasswordVisible ? <FaEyeSlash /> : <FaEye />,
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
