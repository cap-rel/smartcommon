import { useMemo } from "react";
import { Icon, Label, Select } from "../../../dol";
import { useStates } from "../../../hooks";
import { isUndefined } from "../../../../globals/functions";
import { propTypes } from "./props";

export const Range = ({
    label = null,
    id = null,
    help = null,
    min = 0,
    max = 100,
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
    const labelProps = { id, label, required, help, className };
    const inputProps = { type: "range", id, min: min || 0, max: max || 100, required, disabled };

    return (
        <Label { ...labelProps}>
            <input
                value={value}
                onChange={e => !disabled && onChange(e.target.value)}
                className={`
                    flex-grow w-full appearance-none accent-primary bg-transparent cursor-ew-resize
                `}
                    // ${!finalStep && ((type === "price" || type === "pricey") ? "rounded-l-md" : "rounded-r-md")}
                { ...inputProps}
            />
        </Label>
    );  
};

Range.propTypes = propTypes;