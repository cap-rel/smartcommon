import { isEmpty, isNil } from "../../../globals/functions";
import { Label } from "../../form";
import { useStates } from "../../../hooks";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

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
    label,
    labelRow = false,
    help,
    onValueChange = () => {},
    left,
    right,
    type = "varchar",

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputContainerProps,
    leftProps,
    rightProps, 
    inputProps,
    ...props
}) => {

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

  
  const inputPs = { ...props, ...inputProps };  
  
  const { disabled, required, readOnly, id, value, defaultValue } = inputPs
  
  const inputPsForLabel = { disabled, required, readOnly, id };
  const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };  
  
  const isPassword = type === "password";
  const isLeft = !isEmpty(left);
  const isRight = !isEmpty(right) || type === "password"; // || type === "url" 
  
  const { states, set } = useStates({
    localValue: defaultValue ?? "",
    isPasswordVisible: false
  });

  const { localValue, isPasswordVisible } = states;

  const realValue = value ?? localValue;

  const handleInputOnChange = (e) => {
    const newValue = e.target.value;
    if (isNil(value)) {
      set("localValue", newValue);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <Label { ...allLabelPs}>
      <div
        { ...inputContainerProps}
        className={twMerge(`relative rounded-md ${inputPs?.disabled && "brightness-soft"}`, inputContainerProps?.className)}
      >
        {isLeft &&
          <div
            { ...leftProps}
            className={twMerge(`left-2 text-xl shrink-0 absolute-v-center text-stronger`, leftProps?.className)}              
          >
            {left}
          </div>
        }
        <input
          placeholder={!isNil(label) ? `${label}...` : ""}
          { ...inputPs}
          type={isPassword ? (isPasswordVisible ? "text" : "password") : INPUT_TYPE_MAP[type]}
          onChange={handleInputOnChange}
          value={realValue}
          className={twMerge(`outline-none duration-100 focus:ring-2 ring-primary bg-softest dark:bg-softer py-2 placeholder-stronger grow w-full border border-strong rounded-md truncate ${isLeft ? "pl-9" : "pl-2"} ${isRight ? "pr-9" : "pr-2"}`, inputPs?.className)}
        />
        {isRight &&
          <div
            { ...rightProps}
            onClick={() => isPassword && set("isPasswordVisible", !isPasswordVisible)}
            className={twMerge(`right-2 text-xl shrink-0 absolute-v-center text-stronger`, rightProps?.className)}              
          >
            {isPassword && (
              isPasswordVisible
                ? <FaEyeSlash />
                : <FaEye />
            )}
            {right}
          </div>
        }
      </div>
    </Label>
  )
};

Input.propTypes = propTypes;
