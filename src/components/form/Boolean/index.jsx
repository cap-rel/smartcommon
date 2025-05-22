import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../tools/Label";
import { Switch, Checkbox, Radio, Icon } from "../tools";
import { twMerge } from "tailwind-merge";
import { isNil } from "../../../globals/functions";

import { propTypes } from "./props";
import { mergeProps } from "../../../globals/functions";
// IDEA Add icon to switch like (like / dislike or check / cross, etc)

export const Boolean = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Boolean", props);

    const { extractedLabelProps, filteredProps } = useLabel(variantProps);

    const {
        id,
        name,
        value,
        defaultValue,
        onChange = () => {},

        icon,
        type,

    } = filteredProps;

    // if (labelRow) {
    //     containerProps = { ...containerProps, className: twMerge(`row-between-center bg-soft-bg border border-border p-2 rounded-md`, containerProps?.className) };
    //     labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    // }

    const { currentValue, setValue } = useValue(defaultValue ?? false, value, onChange);

    const handleOnClick = () => setValue(!currentValue);

    return (
        <Label 
            { ...extractedLabelProps}
            mergeProps={mergeProps}
        >
            <input
                type={`checkbox`}
                onChange={() => {}}
                checked={currentValue}
                name={name}
                hidden
            />
            {type === "switch" ?
                <Switch
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                />
            : type === "checkbox" ?
                <Checkbox
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                />
            : type === "radio" ?
                <Radio
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                />
            : type === "icon" ?
                <Icon
                    icon={icon}
                    mergeProps={mergeProps}
                    onClick={handleOnClick}
                    checked={currentValue}
                />
            : ""}
      
        </Label>
    );
};

Boolean.propTypes = propTypes;