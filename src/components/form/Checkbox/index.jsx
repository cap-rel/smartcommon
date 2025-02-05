import { isEmpty } from "../../../globals/functions";
import { Label } from "../../form";
import { Icon } from "../../others";
import { propTypes } from "./props";

export const Checkbox = ({
  label = null,
  id = null,
  help = null,
  name,
  min = 0,
  size = null,
  max = null,
  options,
  multiple = false,
  readOnly = false,
  required = false,
  disabled = false,
  value,
  onChange = () => {},
  color = null,
  className = null
}) => {
  const labelProps = { label, id, help, required, className };

    const renderCheckbox = (option, OI, isChecked) => (
      <label htmlFor={OI} className={`row-v-center bg-soft-smt button-smt gap-2 p-3 ${className}`} key={OI}>
        <input
          id={OI}
          type="checkbox"
          value={option.value}
          name={name}
          checked={isChecked}
          disabled={disabled}
          onChange={e => onChange(e.target.checked ? (multiple ? [...value, option.value] : option.value) : (multiple ? value.filter(item => item !== option.value) : ""))}
          className="hidden"
        />
        <div
          className={`
            relative border-2 duration-100 w-6 h-6 rounded-md flex-shrink-0
            ${isChecked ? "bg-primary border-primary" : "border-smt bg-smt"}
          `}
          style={{ 
            backgroundColor: isChecked && option.color,
            borderColor: isChecked && option.color
          }}
        >
          <Icon
            library="fa"
            name="FaCheck"
            className={`
              w-3 h-3 text-white
              ${isChecked ? "absolute-full-center opacity-100 duration-100" : "opacity-0 absolute-h-center bottom-0"}
            `}
          />
        </div>
        <span className={`${isChecked ? "text-smt" : "text-soft-smt"} duration-100`}>
          {option.label}
        </span>
      </label>
    );

    return (
      <Label { ...labelProps}>
        <div className={`col border border-smt rounded-md divide-y divide-smt`}>
          {!isEmpty(options) && options.map((option, OI) => renderCheckbox(option, `${name}${OI}`, value.includes(option.value)))}
        </div>
      </Label>
    );
};

Checkbox.propTypes = propTypes;