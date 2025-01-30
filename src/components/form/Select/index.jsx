import { Icon, Label } from "../../../dol";
import { propTypes } from "./props";

export const Select = ({
  label = null,
  id = null,
  help = null,
  placeholder = "Sélectionner ...",
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
 
  return (
    <Label { ...labelProps}>
      <div className={`relative rounded-md`}>
        <select 
          id={id}
          className={`py-2 pl-2 pr-7 appearance-none border-dol border-2 outline-none button-dol bg-soft-dol w-full rounded-md`}
          multiple={multiple}
          value={value}
          disabled={disabled}
          required={required}
          onChange={(e) => {
            if (multiple) {
              onChange(Array.from(e.target.selectedOptions, option => option.value))
            } else {
              onChange(e.target.value);
            }
          }}
        >
          <option value={``} disabled={true}>{placeholder}</option>
          {options && options.map((option, OI) => 
            typeof option === "object"
              ? <option key={OI} value={option.value}>{option.label}</option>
              : <option key={OI} value={option}>{option}</option>
          )}
        </select>
        <span className={`absolute-v-center right-2 z-10 pointer-events-none`}>
          <Icon library={`io`} icon={`IoIosArrowDown`} />
        </span>
      </div>
    </Label>
  );
};

Select.propTypes = propTypes;