import { Fragment, useEffect, useRef, useState } from "react";
import { isNumber, isNil } from "lodash";

import { formatDuration, secsToDuration, twMerge } from "lib/utils";
import { Label } from "lib/components";
import { useField, useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Timer = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Timer", props);

    const {
        name,
        defaultValue,
        value,
        onChange = () => {},

        required,
        disabled,
        readOnly,

        min,
        max,

        showSeconds = true,
        maxDays,
    } = variantProps;

    const errors = (currentValue) => ({
        required: {
            condition: required && currentValue === 0,
            message: "Ce champ est requis."
        },
        min: {
            condition: !isNil(min) && currentValue < min,
            message: `La durée doit être de ${formatDuration(min)} au minimum.`
        },
        max: {
            condition: !isNil(max) && currentValue > max,
            message: `La valeur doit être de ${formatDuration(max)} au maximum.`
        },
    });

    const { currentValue, setValue, isFormSubmitted, isFormSubmitting, filteredErrors } = useField({ name, defaultValue, value, onChange, errors });

    // Guarantee a finite number for duration maths - currentValue may be undefined
    // (before field init) or a non-numeric string coming from a parent form.
    const safeCurrentValue = isNumber(currentValue) && !Number.isNaN(currentValue) ? currentValue : 0;

    const units = {
        days: { label: "Jours", seconds: 60 * 60 * 24, max: 9999 },
        hours: { label: "Heures", seconds: 60 * 60, max: 23 },
        minutes: { label: "Minutes", seconds: 60, max: 59 },
        seconds: { label: "Secondes", seconds: 1, max: 59 }
    };

    // Visible columns, in fixed order. The seconds column is dropped when
    // showSeconds is false (matches the closed-display behaviour).
    const visibleUnits = ["days", "hours", "minutes", "seconds"].filter(
        (key) => key !== "seconds" || showSeconds
    );

    // Days range cannot realistically span 0..9999 in a scroll wheel. Cap it
    // to maxDays when provided, else derive from `max` (in seconds), else 99.
    const derivedMaxDays = !isNil(max) ? Math.floor(max / units.days.seconds) : 99;
    const daysMax = isNumber(maxDays) ? maxDays : derivedMaxDays;

    const ranges = {
        days: Array.from({ length: daysMax + 1 }, (_, n) => n),
        hours: Array.from({ length: 24 }, (_, n) => n),
        minutes: Array.from({ length: 60 }, (_, n) => n),
        seconds: Array.from({ length: 60 }, (_, n) => n),
    };

    const [open, setOpen] = useState(false);
    const [activeUnit, setActiveUnit] = useState(null);
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    const interactive = !disabled && !readOnly && !isFormSubmitting;

    const formatUnit = (number) => `0${number}`.slice(-2);

    const displayValue = (unitKey) => {
        const raw = secsToDuration(safeCurrentValue)[unitKey];
        return unitKey === "days" ? raw : formatUnit(raw);
    };

    const handleSelect = (unitKey, unitValue) => {
        if (!interactive) return;
        const numberValue = isNumber(Number(unitValue)) ? Number(unitValue) : 0;
        const unit = units[unitKey];
        if (numberValue <= unit.max) {
            // When the Seconds column is hidden, dropping the sub-minute
            // residue on every Minutes (or coarser) edit matches the user's
            // mental model: they only see/control whole minutes, so any
            // phantom seconds inherited from a pre-existing value are
            // intentionally lost on the next edit.
            const baseValue = (!showSeconds && unitKey !== "seconds")
                ? safeCurrentValue - secsToDuration(safeCurrentValue).seconds
                : safeCurrentValue;
            const unitLastValue = secsToDuration(baseValue)[unitKey] * unit.seconds;
            const newValue = baseValue - unitLastValue + numberValue * unit.seconds;
            setValue(newValue);
        }
    };

    const openPicker = (unitKey) => {
        if (!interactive) return;
        setActiveUnit(unitKey);
        setOpen(true);
    };

    // Close the picker when clicking outside the whole widget (same pattern
    // as SearchableSelect).
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Center the currently selected value of every column when the panel
    // opens. scrollIntoView is guarded for jsdom (no-op there).
    useEffect(() => {
        if (!open || !dropdownRef.current) return;
        const selected = dropdownRef.current.querySelectorAll("[data-selected='true']");
        selected.forEach((el) => {
            if (typeof el.scrollIntoView === "function") {
                el.scrollIntoView({ block: "center" });
            }
        });
    }, [open]);

    return (
        <Label
            {...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
            mergeProps={mergeProps}
        >
            <input
                name={name}
                onChange={() => {}}
                value={currentValue ?? ""}
                hidden
            />

            <div ref={containerRef} className="relative w-full">
                <div
                    {...mergeProps("durationContainer", (p) => ({
                        ...p,
                        className: twMerge(
                            "p-app-xs w-full rounded-app-md border flex items-center bg-soft-bg border-border duration-(--instant)",
                            interactive ? "cursor-pointer" : "cursor-not-allowed",
                            open && "ring-1 ring-primary border-primary",
                            p.className
                        ),
                    }))}
                >
                    {visibleUnits.map((unitKey, index) => (
                        <Fragment key={unitKey}>
                            {index > 0 && unitKey !== "hours" && (
                                <span
                                    {...mergeProps("separator", (p) => ({
                                        ...p,
                                        className: twMerge("text-app-xl text-soft-text px-app-xxs", p.className),
                                    }))}
                                >
                                    :
                                </span>
                            )}
                            <button
                                type="button"
                                data-timer-cell={unitKey}
                                disabled={!interactive}
                                onClick={() => openPicker(unitKey)}
                                {...mergeProps("cell", (p) => ({
                                    ...p,
                                    className: twMerge(
                                        "flex-1 flex flex-col items-center justify-center px-app-xxs",
                                        unitKey === "days" && "border-r border-border pr-app-xs mr-app-xxs",
                                        activeUnit === unitKey && open && "text-primary",
                                        p.className
                                    ),
                                }))}
                            >
                                <span className="text-app-xl text-center leading-none">
                                    {displayValue(unitKey)}
                                </span>
                                <span className="text-soft-text italic text-app-sm">
                                    {units[unitKey].label}
                                </span>
                            </button>
                        </Fragment>
                    ))}
                </div>

                {open && interactive && (
                    <div
                        ref={dropdownRef}
                        {...mergeProps("dropdown", (p) => ({
                            ...p,
                            className: twMerge(
                                "absolute z-50 top-full left-0 mt-1 min-w-full bg-strong-bg border border-border rounded-app-md shadow-lg",
                                p.className
                            ),
                        }))}
                    >
                        <div
                            {...mergeProps("columnsContainer", (p) => ({
                                ...p,
                                className: twMerge("flex items-stretch divide-x divide-border", p.className),
                            }))}
                        >
                            {visibleUnits.map((unitKey) => {
                                const selectedNumber = secsToDuration(safeCurrentValue)[unitKey];
                                return (
                                    <div
                                        key={unitKey}
                                        {...mergeProps("column", (p) => ({
                                            ...p,
                                            className: twMerge(
                                                "flex-1 flex flex-col min-w-14",
                                                activeUnit === unitKey && "bg-soft-bg",
                                                p.className
                                            ),
                                        }))}
                                    >
                                        <div
                                            {...mergeProps("columnHeader", (p) => ({
                                                ...p,
                                                className: twMerge(
                                                    "text-center text-soft-text italic text-app-xs py-app-xxs border-b border-border",
                                                    p.className
                                                ),
                                            }))}
                                        >
                                            {units[unitKey].label}
                                        </div>
                                        <div
                                            {...mergeProps("columnList", (p) => ({
                                                ...p,
                                                className: twMerge(
                                                    "h-48 overflow-y-auto snap-y snap-mandatory py-20",
                                                    p.className
                                                ),
                                            }))}
                                        >
                                            {ranges[unitKey].map((n) => {
                                                const isSelected = n === selectedNumber;
                                                return (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        data-unit={unitKey}
                                                        data-value={n}
                                                        data-selected={isSelected}
                                                        onClick={() => handleSelect(unitKey, n)}
                                                        {...mergeProps("option", (p) => ({
                                                            ...p,
                                                            className: twMerge(
                                                                "w-full h-10 flex items-center justify-center snap-center text-app-base cursor-pointer",
                                                                isSelected
                                                                    ? "bg-primary text-white font-semibold rounded-app-base"
                                                                    : "text-app-base hover:bg-soft-bg",
                                                                p.className
                                                            ),
                                                        }))}
                                                    >
                                                        {unitKey === "days" ? n : formatUnit(n)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            {...mergeProps("footer", (p) => ({
                                ...p,
                                className: twMerge("flex justify-end border-t border-border p-app-xxs", p.className),
                            }))}
                        >
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                {...mergeProps("okButton", (p) => ({
                                    ...p,
                                    className: twMerge(
                                        "px-app-md py-app-xxs text-primary font-semibold text-app-base cursor-pointer",
                                        p.className
                                    ),
                                }))}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Label>
    );
};

Timer.propTypes = propTypes;
