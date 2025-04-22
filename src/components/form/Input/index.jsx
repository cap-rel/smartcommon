import { isNil } from "../../../globals/functions";
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
  const { variantProps, mergeProps } = useVariantToProps("input", props);

  const { extractedLabelProps, filteredProps } = useLabel(variantProps);

  const { icon, hasCopyButton, loading, inputProps = {} } = filteredProps;

  const { type, disabled, min, max, step, defaultValue, value, onChange = () => {} } = inputProps;
        
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

  const handleMinusButtonOnClick = e => {
    e.preventDefault();
    setValue(Number(currentValue) - step);
  }

  const handlePlusButtonOnClick = e => {
    e.preventDefault();
    setValue(Number(currentValue) + step);
  }

  const handlePasswordButtonOnClick = e => {
    e.preventDefault();
    set("isPasswordVisible", !isPasswordVisible);
  };

  const handleCopyButtonOnBlur = () => set("isCopied", false);

  const handleCopyButtonOnClick = e => {
    e.preventDefault();
    navigator.clipboard.writeText(currentValue)
      .then(() => {
        set("isCopied", true);
        toast("Copié dans le presse-papier")
      })
      .catch(() => toast.error("La copie a échouée, probablement non disponible sur votre navigateur"));
  };

  return (

    <Label 
      { ...extractedLabelProps}
      mergeProps={mergeProps}
    >
      <div { ...mergeProps("inputContainer", props => ({
        ...props,
        className: `min-w-0 w-full flex items-center rounded-app-md 
          p-app-xs gap-app-xs bg-soft-bg border-border border duration-(--instant)
          has-[input:focus]:ring-primary has-[input:focus]:border-primary has-[input:focus]:ring-1 
          has-[input:disabled]:brightness-soft
        `
        // has-[input:invalid]:ring-1 has-[input:invalid]:ring-error has-[input:invalid]:border-error 
      }))}>        
        {loading &&
          <Spinner { ...mergeProps("Spinner", props => props)} />
        }

        {(!isNil(icon) && !loading) &&
          <div { ...mergeProps("icon", props => ({
            ...props,
            className: `text-lg shrink-0 text-medium-text`
          }))}>
            {icon}
          </div>
        }

        <input { ...mergeProps("input", props => ({
          ...props,
          className: `outline-hidden min-w-0 grow placeholder-soft-text truncate`,
          minLength: min,
          maxLength: max,
          onChange: handleInputOnChange,
          value: currentValue
        }))} />

        {!isNil(step) &&
          <>
            <Button { ...mergeProps("MinusButton", props => ({
              icon: <FaMinus />,
              ...props,
              buttonProps: {
                ...props.buttonProps,
                disabled: disabled,
                onClick: handleMinusButtonOnClick,
                className: `p-0 bg-transparent text-soft-text`
              }
            }))} />
            <Button { ...mergeProps("PlusButton", props => ({
              icon: <FaPlus />,
              ...props,
              buttonProps: {
                ...props.buttonProps,
                disabled: disabled,
                onClick: handlePlusButtonOnClick,
                className: `p-0 bg-transparent text-soft-text`
              }
            }))} />
          </>
        }

        {type === "password" &&
          <Button { ...mergeProps("PasswordButton", props => ({
            icon: isPasswordVisible ? <FaEyeSlash /> : <FaEye />,
            ...props,
            buttonProps: {
              ...props.buttonProps,
              disabled: disabled,
              onClick: handlePasswordButtonOnClick,
              className: `p-0 bg-transparent text-soft-text`
            }
          }))} />
        }

        {hasCopyButton &&
          <Button { ...mergeProps("CopyButton", props => ({
            icon: isCopied ? <FaClipboardCheck /> : <FaRegClipboard />,
            ...props,
            buttonProps: {
              ...props.buttonProps,
              disabled: disabled,
              onClick: handleCopyButtonOnClick,
              onBlur: handleCopyButtonOnBlur,
              className: `p-0 bg-transparent ${isCopied ? "text-primary" : "text-soft-text"}`
            }
          }))} />
        }
      </div>
    </Label>
  )
};

Input.propTypes = propTypes;
