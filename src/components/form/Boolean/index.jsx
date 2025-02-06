import { useEffect, useMemo } from "react";
import { useStates, useWindow } from "../../../hooks";
import { Icon } from "../../others";
import { Label } from "../Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, CheckedIcon } from "../tools";

// todo add icon to switch like (like / dislike or check / cross, etc)

export const Boolean = ({
    id = null,
    name = null,
    label = null,
    help = {
        position: "popup", // or top or bottom
        text: null // can only be text
    },
    variant = "switch",
    readOnly = false,
    required = false,
    disabled = false,
    booleanRef = null,
    value = null,
    onChange = () => {},
    color = null,
    custom = {
        // color: null,
        // activeColor: null,
        // icon: null,
        // activeIcon: null, // todo customization ++
        customType: null,
        classNames: {
            container: null,
            label: null,
            requiredIcon: null,
            disabledIcon: null,
            readOnlyIcon: null,
            HelpIcon: null,      //
            helpContainer: null, // todo
            helpText: null,      //

            input: null,
            checkIcon: null, // only for checkbox
            circle: null // only for switch and radio
        },
    }
}) => {
    const { darkMode } = useWindow();
    const labelProps = { label, id, name, help, readOnly, required, disabled };
    const inputProps = { id, name, readOnly, required, disabled };
    const { classNames } = custom;

    const cursor = disabled ? "cursor-not-allowed" : "cursor-pointer";
    const blocked = disabled || readOnly;

    const { states, set } = useStates({
        localValue: value ?? false
    });

    const { localValue } = states;

    return (
        <Label
            // style={{ "--color": color || "var('--color-primary')" }}
            row
            { ...labelProps}
        >
            <input
                type={`checkbox`}
                ref={booleanRef}
                className={`fixed appearance-none size-0`}
                checked={localValue}
                onChange={e => onChange(e.target.checked) || set("localValue", e.target.checked)}
                { ...inputProps}
            />
            {variant === "switch" ?
                <Switch
                    onClick={() => set("localValue", !localValue, !blocked)}
                    checked={localValue}
                    cursor={cursor}
                    classNames={{
                        input: classNames.input,
                        circle: classNames.circle
                    }}
                />
            : variant === "checkbox" ?
                <Checkbox
                    onClick={() => set("localValue", !localValue, !blocked)}
                    checked={localValue}
                    cursor={cursor}
                    classNames={{
                        input: classNames.input,
                        checkIcon: classNames.checkIcon
                    }}
                />
            : variant === "radio" ?
                <Radio
                    onClick={() => set("localValue", !localValue, !blocked)}
                    checked={localValue}
                    cursor={cursor}
                    classNames={{
                        input: classNames.input,
                        circle: classNames.circle
                    }}
                />
            : variant === "star" ?
                <CheckedIcon
                    onClick={() => set("localValue", !localValue, !blocked)}
                    library={`fa6`}
                    name={localValue ? "FaStar" : "FaRegStar"}
                    cursor={cursor}
                    classNames={{
                        input: classNames.input,
                    }}
                />
            : variant === "heart" ?
                <CheckedIcon
                    onClick={() => set("localValue", !localValue, !blocked)}
                    library={`io5`}
                    name={localValue ? "IoHeart" : "IoHeartOutline"}
                    cursor={cursor}
                    classNames={{
                        input: classNames.input,
                    }}
                />
            : ""}
      
        </Label>
    );
};

Boolean.propTypes = propTypes;