import { useEffect, useMemo } from "react";
import { useStates, useWindow } from "../../../hooks";
import { Icon } from "../../others";
import { Label } from "../Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, CheckedIcon } from "../tools";

export const Single = ({
    id = null,
    name,
    label = null,
    help = {
        position: "popup", // or top or bottom
        text: null // can only be text
    },
    variant = {
        display: "grid", // todo or buttons or field not for select
        mode: "select"
    },
    options = [],
    readOnly = false,
    required = false,
    disabled = false,
    singleRef = null,
    value = null,
    onChange = () => {},
    customType = null,
    custom = {
        colors: null, // todo colors for options
        classNames: null
    }
}) => {
    const { darkMode } = useWindow();
    const labelProps = { label, id, name, help, readOnly, required, disabled };
    const inputProps = { name, readOnly, required, disabled };
    
    const { mode, display } = variant;
    const { classNames } = custom;

    const cursor = disabled ? "cursor-not-allowed" : "cursor-pointer";
    const blocked = disabled || readOnly;

    const { states, set } = useStates({
        localValue: value ?? ""
    });

    const { localValue } = states;

    return (
        <Label
            // style={{ "--color": color || "var('--color-primary')" }}
            { ...labelProps}
        >
            {mode === "select" ?
                <div className={`relative rounded-md`}>
                    <select
                        id={id}
                        ref={singleRef}
                        value={localValue}
                        onChange={e => onChange(e.target.value) || set("localValue", e.target.value)}
                        className={`py-2 pl-2 pr-7 appearance-none border-smt border-2 outline-none button-smt bg-soft-smt w-full rounded-md`}
                        { ...inputProps}
                    >
                        {options.map((option, OI) =>
                            <option 
                                key={name + OI}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        )}
                    </select>
                    <Icon
                        library={`io`}
                        name={`IoIosArrowDown`}
                        className={`absolute-v-center right-2 z-10 pointer-events-none`}
                    />
                </div>
            :   <div className={`grid grid-cols-3 gap-4`}>
                    {options.map((option, OI) => {
                        const isChecked = localValue === option.value;
                        const onClick = () => set("localValue", isChecked ? "" : option.value, !blocked)
                        return (
                            <div
                                key={name + OI}
                                className={`row-v-center gap-2`}
                            >
                                <label htmlFor={name + OI}>{option.label}</label>
                                <input
                                    id={name + OI}
                                    type={`checkbox`}
                                    ref={singleRef}
                                    className={`fixed appearance-none size-0`}
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={e => {
                                        if (isChecked) {
                                            onChange("") || set("localValue", "")
                                        } else {
                                            if (e.target.checked) {
                                                onChange(e.target.value) || set("localValue", e.target.value)
                                            }
                                        }
                                    }}
                                    { ...inputProps}
                                />
                                {mode === "switch" ?
                                    <Switch
                                        onClick={onClick}
                                        checked={isChecked}
                                        cursor={cursor}
                                    />
                                : mode === "checkbox" ?
                                    <Checkbox
                                        onClick={onClick}
                                        checked={isChecked}
                                        cursor={cursor}
                                    />
                                : mode === "radio" ?
                                    <Radio
                                        onClick={onClick}
                                        checked={isChecked}
                                        cursor={cursor}
                                    />
                                : mode === "button" ?
                                    ""
                                : mode === "star" ?
                                    <CheckedIcon
                                        onClick={onClick}
                                        library={`fa6`}
                                        name={isChecked ? "FaStar" : "FaRegStar"}
                                        cursor={cursor}
                                    />
                                : mode === "heart" ?
                                    <CheckedIcon
                                        onClick={onClick}
                                        library={`io5`}
                                        name={isChecked ? "IoHeart" : "IoHeartOutline"}
                                        cursor={cursor}
                                    />
                                : ""}
                            </div>
                        );
                    })}
                </div>
            }
        </Label>
    );
};

Single.propTypes = propTypes;