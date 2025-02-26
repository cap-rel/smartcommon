import { isEmpty } from "../../../globals/functions";
import { Label } from "../../form";
import { Icon } from "../../others";
import { useStates } from "../../../hooks";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";

// IDEA Prefix / suffix
// IDEA Select (phone, ...)
// IDEA Default pattern, min, length, ...
// IDEA Default Icons
// IDEA Types week, month, year
// IDEA Clipboard
// IDEA Random id for label and input

// TODO All steppers
// TODO Stepper

export const Input = ({
    label,
    labelRow = false,
    help,
    leftIcon,
    rightIcon,
    type = "varchar",

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputContainerProps,
    leftIconProps,
    rightIconProps, 
    inputProps,
    ...props
}) => {

  const { states, set } = useStates({
    isPasswordVisible: false,
  });

  const { isPasswordVisible, test } = states;

  const INPUT_TYPE_MAP = {
    varchar      : "text",
    mail         : "email",
    password     : "password",
    phoneNumber  : "tel",
    url          : "url",
    ip           : "text",
    date         : "date",
    timestamp    : "number",
    time         : "time",
    datetime     : "datetime-local",
    integer      : "number",
    stock        : "number",
    float        : "number",
    price        : "number",
    priceCurrency: "number",
    // week     :
    // month    :
  };

  const isPassword = type === "password";  

  const leftIconPs = { ...leftIcon, ...leftIconProps };
  const rightIconPs = { ...rightIcon, ...rightIconProps };
  const inputPs = { ...props, ...inputProps };  

  const isLeftIcon = !isEmpty(leftIconPs);
  const isRightIcon = !isEmpty(rightIconPs) || type === "password"; // || type === "url" 

  const { disabled, required, readOnly, id } = inputPs

  const inputPsForLabel = { disabled, required, readOnly, id };
  const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };  

  return (
    <Label { ...allLabelPs}>
      
      <div
        { ...inputContainerProps}
        className={twMerge(`relative rounded-md ${inputPs?.disabled && "brightness-90 *:cursor-not-allowed"}`, inputContainerProps?.className)}
      >
        
        {isLeftIcon &&
          <Icon
            { ...leftIconPs}
            className={twMerge(`left-2 text-xl shrink-0 absolute-v-center text-soft-text`, leftIconPs?.className)}              
          />
        }

        <input
          type={INPUT_TYPE_MAP[type]}
          { ...inputPs}
          className={twMerge(`outline-none focus:ring-2 ring-primary bg-strong py-2 placeholder-soft-text flex-grow w-full border border-soft-border rounded-md truncate ${isLeftIcon ? "pl-9" : "pl-2"} ${isRightIcon ? "pr-9" : "pr-2"}`, inputPs?.className)}
        />

        {isRightIcon &&
          <Icon
            onClick={() => isPassword && set("isPasswordVisible", !isPasswordVisible)}
            library={isPassword && "fa6"}
            name={isPassword && (isPasswordVisible ? "FaEyeSlash" : "FaEye")}
            { ...rightIconPs}
            className={twMerge(`right-2 text-xl shrink-0 absolute-v-center text-soft-text`, rightIconPs?.className)}              
          />
        }

      </div>

    </Label>
  )
};

Input.propTypes = propTypes;
