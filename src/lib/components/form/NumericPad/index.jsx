import { useCallback } from "react";
import { FaDeleteLeft, FaCheck } from "react-icons/fa6";

import { useVariantMerger } from "lib/hooks";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

const KEYS_ROW_1 = ["7", "8", "9"];
const KEYS_ROW_2 = ["4", "5", "6"];
const KEYS_ROW_3 = ["1", "2", "3"];

/**
 * Reusable numeric keypad for quantity / price / PIN input. Supports integer
 * and decimal modes. Controlled component: caller owns `value` / `onChange`.
 */
export const NumericPad = (props) => {
    const { mergeProps } = useVariantMerger("NumericPad", props);
    const {
        value,
        onChange,
        onConfirm,
        mode,
        label,
        labels: labelsProp,
        backspaceIcon,
        confirmIcon,
    } = props;

    const labels = { ...DEFAULT_LABELS, ...(labelsProp || {}) };

    const handleKey = useCallback(
        (key) => {
            if (key === "backspace") {
                const newVal = value.slice(0, -1);
                onChange(newVal || "0");
                return;
            }
            if (key === ",") {
                // Only allow one decimal separator in decimal mode
                if (mode !== "decimal" || value.includes(",")) return;
                onChange(value + ",");
                return;
            }
            // Replace leading zero with the typed digit
            if (value === "0" && key !== ",") {
                onChange(key);
                return;
            }
            // Limit decimal places to 2
            if (mode === "decimal" && value.includes(",")) {
                const decimals = value.split(",")[1];
                if (decimals && decimals.length >= 2) return;
            }
            onChange(value + key);
        },
        [value, onChange, mode]
    );

    const handleConfirm = useCallback(() => {
        if (onConfirm) onConfirm(value);
    }, [onConfirm, value]);

    const renderKey = (key, content, ariaLabel) => (
        <button
            key={key}
            type="button"
            aria-label={ariaLabel}
            onClick={() => handleKey(key)}
            className={`flex items-center justify-center h-14 rounded-xl text-xl font-semibold
                bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100
                active:bg-gray-200 dark:active:bg-gray-600 transition-colors`}
        >
            {content ?? key}
        </button>
    );

    const resolvedBackspaceIcon = backspaceIcon ?? <FaDeleteLeft className="text-lg" />;
    const resolvedConfirmIcon = confirmIcon ?? <FaCheck />;

    return (
        <div
            {...mergeProps("container", (p) => ({
                ...p,
                "data-component": "NumericPad",
            }))}
        >
            {label && (
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {label}
                </div>
            )}

            {/* Display */}
            <div
                aria-live="polite"
                className="text-3xl font-bold text-center py-4 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3 text-gray-900 dark:text-white min-h-[3.5rem] flex items-center justify-center"
            >
                {value || "0"}
            </div>

            {/* Keys grid */}
            <div className="grid grid-cols-3 gap-2">
                {KEYS_ROW_1.map((k) => renderKey(k, null, labels.digit(k)))}
                {KEYS_ROW_2.map((k) => renderKey(k, null, labels.digit(k)))}
                {KEYS_ROW_3.map((k) => renderKey(k, null, labels.digit(k)))}

                {/* Bottom row */}
                {mode === "decimal"
                    ? renderKey(",", ",", labels.decimalSeparator)
                    : <div />
                }
                {renderKey("0", null, labels.digit("0"))}
                {renderKey("backspace", resolvedBackspaceIcon, labels.backspace)}
            </div>

            {/* Confirm button */}
            {onConfirm && (
                <button
                    type="button"
                    aria-label={labels.confirm}
                    onClick={handleConfirm}
                    className="mt-3 w-full h-14 rounded-xl bg-blue-600 text-white font-bold text-lg
                        flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"
                >
                    {resolvedConfirmIcon}
                </button>
            )}
        </div>
    );
};

NumericPad.propTypes = propTypes;
NumericPad.defaultProps = defaultProps;
