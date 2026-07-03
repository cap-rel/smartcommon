import { useCallback } from "react";
import { FaDeleteLeft, FaCheck } from "react-icons/fa6";

import { useVariantMerger } from "lib/hooks";

import { DEFAULT_LABELS, defaultProps, propTypes } from "./props";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Touch-friendly numeric PIN pad for entering a masked secret (screen lock,
 * operator PIN, passcode). Controlled via `value`/`onChange`; the validate key
 * calls `onSubmit` once `value` reaches `minLength`. Entered digits are masked
 * as dots. Use `tone="light"` on a card and `tone="dark"` on a black overlay.
 *
 * Distinct from NumericPad, which shows the typed value and is meant for
 * quantity/price entry: PinPad masks the value and adds length/error/lockout
 * semantics.
 */
export const PinPad = (props) => {
    const { mergeProps } = useVariantMerger("PinPad", props);
    const {
        value,
        onChange,
        onSubmit,
        minLength,
        maxLength,
        tone,
        error,
        disabled,
        labels: labelsProp,
    } = props;

    const labels = { ...DEFAULT_LABELS, ...(labelsProp || {}) };
    const isDark = tone === "dark";

    const append = useCallback(
        (digit) => {
            if (disabled || value.length >= maxLength) return;
            onChange(value + digit);
        },
        [disabled, value, maxLength, onChange]
    );

    const backspace = useCallback(() => {
        if (disabled || value.length === 0) return;
        onChange(value.slice(0, -1));
    }, [disabled, value, onChange]);

    const submit = useCallback(() => {
        if (disabled || value.length < minLength) return;
        if (onSubmit) onSubmit();
    }, [disabled, value, minLength, onSubmit]);

    // Shared geometry + press feedback for every key. Square keys line up in a
    // clean 3-column grid; active:scale gives a tactile tap response.
    const keyBase = `aspect-square rounded-2xl flex items-center justify-center
        transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100`;

    const keyClass = isDark
        ? "bg-white/[0.06] text-white border border-white/10 hover:bg-white/10 active:bg-white/20"
        : "bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 active:bg-gray-300 dark:active:bg-white/20";

    // Backspace is deliberately quieter than the digits so it reads as an aux key.
    const subtleClass = isDark
        ? "text-white/60 hover:bg-white/5 active:bg-white/10"
        : "text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 active:bg-gray-200 dark:active:bg-white/10";

    // One dot per entered digit, padded to minLength so the target length reads
    // clearly even before anything is typed.
    const dotCount = Math.max(value.length, minLength);
    const filledClass = isDark ? "bg-white scale-110" : "bg-gray-800 dark:bg-white scale-110";
    const emptyClass = error
        ? "border-2 border-red-500"
        : isDark
            ? "border-2 border-white/25"
            : "border-2 border-gray-300 dark:border-white/25";

    return (
        <div
            {...mergeProps("container", (p) => ({
                ...p,
                "data-component": "PinPad",
            }))}
        >
            <div className="flex items-center justify-center gap-2.5 h-5 mb-5">
                {Array.from({ length: dotCount }).map((_, i) => (
                    <span
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                            i < value.length ? filledClass : emptyClass
                        }`}
                    />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
                {DIGITS.map((digit) => (
                    <button
                        key={digit}
                        type="button"
                        onClick={() => append(digit)}
                        disabled={disabled}
                        className={`${keyBase} text-lg font-semibold ${keyClass}`}
                    >
                        {digit}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={backspace}
                    disabled={disabled || value.length === 0}
                    aria-label={labels.backspace}
                    className={`${keyBase} text-base ${subtleClass}`}
                >
                    <FaDeleteLeft />
                </button>
                <button
                    type="button"
                    onClick={() => append("0")}
                    disabled={disabled}
                    className={`${keyBase} text-lg font-semibold ${keyClass}`}
                >
                    0
                </button>
                <button
                    type="button"
                    onClick={submit}
                    disabled={disabled || value.length < minLength}
                    aria-label={labels.validate}
                    className={`${keyBase} text-base font-bold bg-blue-600 text-white
                        hover:bg-blue-500 active:bg-blue-700 shadow-lg shadow-blue-600/25
                        disabled:cursor-not-allowed disabled:shadow-none`}
                >
                    <FaCheck />
                </button>
            </div>
        </div>
    );
};

PinPad.propTypes = propTypes;
PinPad.defaultProps = defaultProps;
