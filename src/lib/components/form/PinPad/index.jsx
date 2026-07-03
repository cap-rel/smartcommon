import { useCallback, useEffect } from "react";
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
 *
 * Physical keyboard entry is supported through the `keyboard` prop: "global"
 * (default) listens on `document` for a full-screen lock screen, "local" only
 * reacts while the pad is focused (settings pinpad next to other fields), and
 * false keeps it touch-only. Digit keys append, Backspace deletes, Enter
 * submits.
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
        // React 19 no longer applies function-component defaultProps at runtime,
        // so the default lives here (not only in props.js) to stay effective.
        keyboard = "global",
        error,
        disabled,
        labels: labelsProp,
    } = props;

    const labels = { ...DEFAULT_LABELS, ...(labelsProp || {}) };
    const isDark = tone === "dark";
    // Normalize the keyboard mode: `true` is an alias of "global", `false` of "off".
    const keyMode = keyboard === true ? "global" : keyboard === false ? "off" : keyboard;

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

    // Shared physical-keyboard handler for both the "global" (document) and
    // "local" (container onKeyDown) modes. Reuses the same append/backspace/
    // submit callbacks as the touch keys, so all length/error/disabled rules
    // stay in one place.
    const handleKey = useCallback(
        (e) => {
            if (disabled) return;
            const { key } = e;
            if (/^[0-9]$/.test(key)) {
                append(key);
            } else if (key === "Backspace") {
                e.preventDefault(); // avoid browser back-navigation
                backspace();
            } else if (key === "Enter") {
                e.preventDefault(); // avoid submitting an enclosing form
                submit();
            }
        },
        [disabled, append, backspace, submit]
    );

    // "global" mode: listen on document (lock screen). Skip when the user is
    // typing in a real editable field so we never steal their keystrokes.
    useEffect(() => {
        if (keyMode !== "global") return undefined;
        const onKeyDown = (e) => {
            const tag = e.target?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
            handleKey(e);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [keyMode, handleKey]);

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
                // "local" mode: make the pad focusable and handle keys only
                // while it holds focus, so it never grabs keystrokes meant for
                // sibling fields on the same page.
                ...(keyMode === "local"
                    ? { tabIndex: 0, onKeyDown: handleKey, className: `outline-none ${p.className || ""}` }
                    : {}),
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
