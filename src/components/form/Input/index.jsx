import { applyFunctionIfNotNil, isNil } from "../../../globals/functions";
import { Label } from "../../form";
import { useStates, useValue, useLabel, useVariantToProps } from "../../../hooks";
import { twMerge } from "tailwind-merge";
import { FaClipboardCheck, FaEye, FaEyeSlash, FaMinus, FaPlus, FaRegClipboard } from "react-icons/fa6";

import { propTypes } from "./props";

import toast from "react-hot-toast";
import { Button, Spinner } from "../../others";

// IDEA Prefix / suffix
// IDEA Select (phone, ...)
// IDEA Default pattern, min, length, ...
// IDEA Default Icons
// IDEA Types week, month, year
// IDEA Clipboard
// IDEA Random id for label and input

// TODO All steppers
// TODO Stepper
// TODO Duration
// TODO Maybe give props for password icons
// TODO Change type attribute

export const Input = (props) => {
  const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("input", props);

  const { extractedLabelProps, filteredProps } = useLabel(variantProps);

  const { 
    id,
    icon,
    loading,
    hasCopyButton,
    step,
    defaultValue,
    value,
    onChange = () => {},
    type,
    disabled = false
  } = filteredProps;

  const { states, set } = useStates({
    isPasswordVisible: false,
    isCopied: false
  });

  const { isPasswordVisible, isCopied } = states;

  const { currentValue, setValue } = useValue(defaultValue, value, onChange);

  const handleInputOnChange = e => setValue(e.target.value);

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
  const resetCopyButton = () => set("isCopied", false);

  const copy = () => {
    navigator.clipboard.writeText(currentValue)
      .then(() => {
        set("isCopied", true);
        toast("Copié dans le presse-papier")
      })
      .catch(() => toast.error("La copie a échouée, probablement non disponible sur votre navigateur"));
  };

  const isPassword = type === "password";

  return (

    <Label 
      { ...extractedLabelProps}
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

        {(!isNil(icon) && !loading) &&
          <div { ...mergeProps("icon", props => ({
            ...props,
            className: `shrink-0 text-soft-text`
          }))}>
            {icon}
          </div>
        }

        <input { ...mergeProps("input", props => ({
          ...props,
          ...mergeQuickProps(props, ["type", "placeholder", "required", "disabled", 
          "readOnly", "min", "max", "minLength", "maxLength", "name", "pattern", "size", "onBlur", "onFocus"]),
          className: `outline-hidden min-w-0 grow placeholder-soft-text truncate text-strong-text`,
          onChange: handleInputOnChange,
          value: currentValue,
          type: isPassword ? (isPasswordVisible ? "text" : "password") : type
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
                applyFunctionIfNotNil(props.onCLick ?? props.buttonProps?.onClick, e);
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
                applyFunctionIfNotNil(props.onCLick ?? props.buttonProps?.onClick, e);
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
              applyFunctionIfNotNil(props.onCLick ?? props.buttonProps?.onClick, e);
            },
            buttonProps: {
              ...props.buttonProps,
              className: `p-0 bg-transparent text-soft-text`
            }
          }))} />
        }

        {hasCopyButton &&
          <Button { ...mergeProps("CopyButton", props => ({
            icon: isCopied ? <FaClipboardCheck /> : <FaRegClipboard />,
            ...props,
            disabled: disabled,
            onClick: e => {
              e.preventDefault();
              copy(e)
              applyFunctionIfNotNil(props.onCLick ?? props.buttonProps?.onClick, e);
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
        }
      </div>
    </Label>
  )
};

Input.propTypes = propTypes;
