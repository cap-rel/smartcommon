import { useState, useEffect, useRef } from "react";
import { isEmpty } from "lodash";

import { Label } from "lib/components";
import { useField, useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

/**
 * SearchableSelect - A select component with search/filter capability
 *
 * @param {string} label - Label text
 * @param {string} placeholder - Placeholder text when no value selected
 * @param {any} value - Selected value
 * @param {function} onChange - Callback when value changes
 * @param {Array} options - Array of {label, value} objects
 * @param {boolean} disabled - Disable the input
 * @param {boolean} required - Mark as required
 */
export const SearchableSelect = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("SearchableSelect", props);

    const {
        name,
        value,
        defaultValue,
        onChange = () => {},
        required,
        disabled,
        placeholder = "Rechercher...",
        options = [],
    } = variantProps;

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);

    const errors = (currentValue) => ({
        required: {
            condition: required && isEmpty(currentValue),
            message: "Ce champ est requis."
        }
    });

    const { currentValue, setValue, isFormSubmitted, filteredErrors } = useField({
        name,
        defaultValue,
        value,
        onChange,
        errors
    });

    const filteredOptions = options.filter(opt =>
        opt.label?.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === currentValue);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (opt) => {
        setValue(opt.value);
        setIsOpen(false);
        setSearch("");
    };

    const handleInputChange = (e) => {
        setSearch(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const handleFocus = () => {
        setIsOpen(true);
        setSearch("");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setValue(null);
        setSearch("");
    };

    return (
        <Label
            {...variantProps}
            showErrors={isFormSubmitted}
            errors={filteredErrors}
            mergeProps={mergeProps}
        >
            <div ref={containerRef} {...mergeProps("container", p => ({
                ...p,
                className: `relative ${p?.className || ""}`
            }))}>
                <input
                    type="text"
                    disabled={disabled}
                    placeholder={selectedOption ? selectedOption.label : placeholder}
                    value={isOpen ? search : (selectedOption?.label || "")}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    {...mergeProps("input", p => ({
                        ...p,
                        className: `w-full py-2 px-3 rounded-app-md border border-border bg-strong-bg text-app-base
                            placeholder-soft-text outline-none focus:border-primary
                            ${disabled ? "brightness-soft cursor-not-allowed" : "cursor-text"}
                            ${p?.className || ""}`
                    }))}
                />

                {/* Clear button */}
                {currentValue && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        {...mergeProps("clearButton", p => ({
                            ...p,
                            className: `absolute right-2 top-1/2 -translate-y-1/2 text-soft-text hover:text-app-base p-1 ${p?.className || ""}`
                        }))}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}

                {/* Dropdown */}
                {isOpen && !disabled && (
                    <div {...mergeProps("dropdown", p => ({
                        ...p,
                        className: `absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto
                            bg-strong-bg border border-border rounded-app-md shadow-lg ${p?.className || ""}`
                    }))}>
                        {filteredOptions.length === 0 ? (
                            <div {...mergeProps("emptyMessage", p => ({
                                ...p,
                                className: `p-3 text-soft-text text-center ${p?.className || ""}`
                            }))}>
                                Aucun resultat
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => handleSelect(opt)}
                                    {...mergeProps("option", p => ({
                                        ...p,
                                        className: `p-3 cursor-pointer hover:bg-soft-bg text-app-base
                                            ${opt.value === currentValue ? "bg-soft-bg font-semibold" : ""}
                                            ${p?.className || ""}`
                                    }))}
                                >
                                    {opt.label}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Label>
    );
};

SearchableSelect.propTypes = propTypes;
