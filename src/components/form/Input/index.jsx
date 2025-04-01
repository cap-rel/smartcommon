import { isEmpty, isNil, mergeProps } from "../../../globals/functions";
import { Label } from "../../form";
import { useStates, useValue } from "../../../hooks";
import { twMerge } from "tailwind-merge";
import { FaClipboardCheck, FaEye, FaEyeSlash, FaLess, FaRegClipboard } from "react-icons/fa6";

import { inputPropTypes } from "./props";
import { inputVariants } from "./variants";
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

export const Input = ({
    id,
    label,
    help,
    type = "varchar",
    icon,
    prefix,
    suffix,
    hasCopyButton = false,
    required,
    readOnly,
    disabled,
    pattern,
    patternMessage,
    min,
    size,
    max,
    step,

    loading = false,

    // name,
    defaultValue,
    value,
    onValueChange = () => {},

    variant = "smart",

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    childrenContainerProps,
    prefixProps,
    suffixProps,

    inputContainerProps,
    spinnerProps,
    iconProps,
    inputProps,

    lessButtonProps,
    plusButtonProps,
    passwordButtonProps,
    copyButtonProps,
    ...props
}) => {
  
  const inputPs = { ...props, ...inputProps };
    
  const labelPs = { id, label, help, disabled, required, prefix, suffix, readOnly, variants: inputVariants, variant, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, childrenContainerProps, prefixProps, suffixProps };  
    
  const { states, set } = useStates({
    isPasswordVisible: false,
    isInputFocused: false,
    isCopied: false
  });

  const { isPasswordVisible, isInputFocused, isCopied } = states;

  const { currentValue, setValue } = useValue(defaultValue ?? "", value, onValueChange);

  const handleInputOnFocus = () => set("isInputFocused", true);
  const handleInputOnBlur = () => set("isInputFocused", false);
  const handleInputOnChange = e => setValue(e.target.value);

  const handleLessButtonOnClick = e => {
    e.preventDefault();
  }
  const handlePlusButtonOnClick = e => {
    e.preventDefault();
  }

  const handlePasswordButtonOnClick = e => {
    e.preventDefault();
    set("isPasswordVisible", !isPasswordVisible);
  };

  const handleCopyButtonOnBlur = () => set("isCopied", false);
  const handleCopyButtonOnClick = e => {
    e.preventDefault();
    set("isCopied", true);
    toast("Copié dans les presse-papier")
  };

  const inputTypes = {
    varchar      : "text",
    email        : "email",
    password     : isPasswordVisible ? "text" : "password",
    phoneNumber  : "tel",
    url          : "url",
    date         : "date",
    timestamp    : "number",
    time         : "time",
    datetime     : "datetime-local",
    int          : "number",
    float        : "number"
  };

  const variantParams = { type: inputTypes[type], isInputFocused, isCopied };

  return (
    <Label { ...labelPs}>
      <div { ...mergeProps(
        {}, `min-w-0 w-full flex p-2 gap-2 items-center bg-soft-bg rounded-md border duration-50 ring-primary has-[input:focus]:border-primary has-[input:focus]:ring-1 border-border has-[input:disabled]:brightness-soft`,
        inputContainerProps, inputVariants, variant, "inputContainerProps", variantParams
      )}>
        {loading &&
          <Spinner />
        }
        {(!isNil(icon) && !loading) &&
          <div { ...mergeProps(
            {}, `text-lg shrink-0 text-medium-text`,
            iconProps, inputVariants, variant, "iconProps", variantParams
          )}>
            {icon}
          </div>
        }
        <input
          { ...mergeProps(
            {}, `inputRef min-w-0 grow placeholder-soft-text truncate`,
            inputPs, inputVariants, variant, "inputProps", variantParams
          )}
          minLength={min}
          maxLength={max}
          
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          readOnly={required}
          onFocus={handleInputOnFocus}
          onBlur={handleInputOnBlur}
          type={inputTypes[type]}
          onChange={handleInputOnChange}
          value={currentValue}
        />
        {!isNil(step) &&
          <>
            <Button
              disabled={disabled}
              variant={`iconButton`}
              className={`p-0 bg-transparent`}
              icon={<FaLess />}
              onClick={handlePasswordButtonOnClick}
            />
            <Button
              disabled={disabled}
              variant={`iconButton`}
              className={`p-0 bg-transparent`}
              icon={<FaPlus />}
              onClick={handlePasswordButtonOnClick}
            />
          </>
        }
        {/* {type === "password" && */}
          <Button
            disabled={disabled}
            variant={`iconButton`}
            className={`p-0 bg-transparent`}
            icon={isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            onClick={handlePasswordButtonOnClick}
          />  
        {/* } */}
        {hasCopyButton &&
          <Button
            disabled={disabled}
            variant={`iconButton`}
            className={`p-0 bg-transparent`}
            icon={
              isCopied 
              ? <FaClipboardCheck className={`text-primary`} />
              : <FaRegClipboard className={`text-soft-text`} />
            }
            onBlur={handleCopyButtonOnBlur}
            onClick={handleCopyButtonOnClick}
          />
        }
      </div>
    </Label>
  )
};

Input.propTypes = inputPropTypes;
