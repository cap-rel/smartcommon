import { useEffect, useMemo } from "react";
import { useStates, useWindow } from "../../../hooks";
import { Icon } from "../../others";
import { Label } from "../Label";
import { propTypes } from "./props";
import classNames from "classnames";

export const Boolean = ({
    id = null,
    name = null,
    label = null,
    help = {
        position: "popup", // or top or bottom
        content: null // can be html 
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
        // activeIcon: null,
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
            checkIcon: null // only for checkbox
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
                <div
                    onClick={() => set("localValue", !localValue, !blocked)}
                    className={`
                        relative rounded-full w-11 h-6 duration-200 flex-shrink-0
                        ${cursor}
                        ${localValue ? "bg-primary" : "bg-slate-300"}
                        ${classNames.input}
                    `}
                >
                    <div className={`
                        absolute top-1 left-1 rounded-full size-4 duration-200
                        ${localValue ? "translate-x-5 bg-white dark:bg-primary" : "bg-light dark:bg-dark-soft"}
                        ${classNames.circle}
                    `}/>
                </div>
            : variant === "checkbox" ?
                <div
                    onClick={() => set("localValue", !localValue, !blocked)}
                    className={`
                        relative duration-100 size-5 rounded-md flex-shrink-0
                        ${cursor}
                        ${localValue ? "bg-primary" : "bg-slate-300"}
                        ${classNames.input}
                    `}
                >
                    <Icon
                        library={`fa6`}
                        name={`FaCheck`}
                        className={`
                            size-3 duration-100 text-white dark:text-primary
                            ${localValue ? "absolute-full-center opacity-100" : "opacity-0 absolute-h-center bottom-0"}
                            ${classNames.checkIcon}
                        `}
                    />
                    {/* ${classNames("text-white dark:text-primary", custom.classNames.checkIcon) */}
                </div>
            : variant === "radio" ?
                <div
                    onClick={() => set("localValue", !localValue, !blocked)}
                    className={`
                        relative duration-50 size-4 rounded-full border-2 flex-shrink-0 box-content
                        ${cursor}
                        ${localValue ? "border-primary" : "border-smt"}
                    `}
                >
                    <div className={`
                        absolute top-0.5 left-0.5 duration-50 bg-primary rounded-full
                        ${localValue ? "size-3 opacity-100" : "opacity-0 size-0"}
                        ${classNames.circle}
                    `}/>
                </div>
            : variant === "star" ?
                <Icon
                    library={`fa6`}
                    name={localValue ? "FaStar" : "FaRegStar"}
                    className={`
                        text-2xl flex-shrink-0 text-primary
                        ${cursor}
                        ${classNames.input}
                    `}
                    onClick={() => set("localValue", !localValue, !blocked)}
                />
            : variant === "heart" ?
                <Icon
                    library={`io5`}
                    name={localValue ? "IoHeart" : "IoHeartOutline"}
                    className={`
                        text-2xl flex-shrink-0 text-primary
                        ${cursor}
                        ${classNames.input}
                    `}
                    onClick={() => set("localValue", !localValue, !blocked)}
                />
            : ""}
      
        </Label>
    );
};

Boolean.propTypes = propTypes;