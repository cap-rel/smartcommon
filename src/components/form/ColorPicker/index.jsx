import { useStates } from "../../../hooks";
import { Label } from "../Label";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const ColorPicker = ({
    label,
    labelRow = false,
    help,
    tailwind = false,
    onValueChange = () => {},

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };
    const { required, readOnly, disabled, id, value, defaultValue } = inputPs;

    const blocked = disabled || readOnly;
  
    const inputPsForLabel = { disabled, required, readOnly, id };

    if (labelRow) {
        containerProps = { ...containerProps, className: twMerge(`row-between-center bg-strong border border-soft-border p-2 rounded-md`, containerProps?.className) };
        labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    }

    const allLabelPs = { label, labelRow, help, containerProps, labelContainerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };

    const { states, set } = useStates({
        localValue: defaultValue ?? ""
    });

    const { localValue } = states;

    const realValue = value ?? localValue;

    const handleColorOnChange = (e) => {
        const newValue = e.target.value;
        
        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue)
        }
    };

    return (
        <Label { ...allLabelPs}>
            {tailwind
                ?   <>
                        <input
                            { ...inputPs}
                            onChange={() => {}}
                            value={realValue}
                            className={twMerge(`hidden`, inputPs?.className)}
                        />
                        <div className={`bg-red-500 rounded-full size-7`}>
                            
                        </div>
                    </>
                :   <input
                        { ...inputPs}
                        type={`color`}
                        onChange={handleColorOnChange}
                        value={realValue}
                        className={twMerge(`size-7 border-strong`, inputPs?.className)}
                    />
            }
        </Label>
    );
};

ColorPicker.propTypes = propTypes;