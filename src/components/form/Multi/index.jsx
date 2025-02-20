import { useEffect, useMemo } from "react";
import { useStates, useWindow } from "../../../hooks";
import { Icon } from "../../others";
import { Label } from "../Label";
import { propTypes } from "./props";
import { Switch, Checkbox, Radio, CheckedIcon } from "../tools";

export const Multi = ({
    id = null,
    name,
    label = null,
    help = {
        position: "popup", // or top or bottom
        text: null // can only be text
    },
    variant = {
        display: "grid", // todo or buttons or field not for select
        columns: "",
        gap: "",
        mode: "select"
    },
    options = [],
    min = 0,
    size = null,
    max = null,
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

    const { display, mode } = variant;
    const { classNames } = custom;

    const cursor = disabled ? "cursor-not-allowed" : "cursor-pointer";
    const blocked = disabled || readOnly;
    const isButtons = mode === "button" || display === "buttons";

    const { states, set } = useStates({
        localValue: value ?? []
    });

    const { localValue } = states;
    
    useEffect(() => onChange && onChange(localValue), [localValue]);

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
                        multiple
                        value={localValue}
                        onChange={e => {
                            const value = Array.from(e.target.selectedOptions, option => option.value);
                            set("localValue", value);
                        }}
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
                        const isChecked = localValue.includes(option.value);
                        const filteredValue = localValue.filter(value => value !== option.value);
                        const onClick = () => display !== "buttons" && set("localValue", isChecked ? filteredValue : [...localValue, option.value], !blocked)
                        const buttonsClass = `border-2 button-smt rounded-md p-2 row-between-center duration-200 bg-smt ${isChecked ? "border-primary text-primary outline-1" : "border-smt text-smt"}`;
                        return (
                            <div
                                key={name + OI}
                                onClick={() => {
                                    if (display === "buttons") {
                                        set("localValue", isChecked ? filteredValue : [...localValue, option.value], !blocked);
                                    }
                                }}
                                className={`
                                    gap-2
                                    ${display === "buttons" ?
                                        buttonsClass
                                    : display === "field" ?
                                        ""
                                    : "row-v-center"}
                                `}
                            >
                                <label htmlFor={name + OI} className={`${display === "buttons" && "pointer-events-none"}`}>{option.label}</label>
                                <input
                                    id={name + OI}
                                    type={`checkbox`}
                                    ref={singleRef}
                                    multiple
                                    className={`fixed appearance-none size-0`}
                                    value={option.value}
                                    checked={isChecked}
                                    // onChange={e => {}}
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

Multi.propTypes = propTypes;