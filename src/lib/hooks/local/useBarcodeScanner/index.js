import { useEffect, useRef, useCallback } from "react";

const CHAR_INTERVAL_MS = 50;
const MIN_BARCODE_LENGTH = 4;

/**
 * Hook that listens for rapid keyboard input (USB barcode scanner emulating a
 * keyboard) and calls onScan when a barcode sequence is detected.
 *
 * Detection heuristic: scanners type each character with sub-50ms intervals
 * and finish with Enter. Slow input (humans typing) is filtered out, as are
 * events originating from form fields.
 *
 * @param {object} options
 * @param {function} options.onScan - Called when a barcode is detected: (barcode: string) => void
 * @param {boolean} [options.enabled=true] - Whether scanning is active
 */
export const useBarcodeScanner = ({ onScan, enabled = true }) => {
    const bufferRef = useRef("");
    const lastKeyTimeRef = useRef(0);
    const timerRef = useRef(null);

    const handleBarcode = useCallback(
        (barcode) => {
            if (barcode.length >= MIN_BARCODE_LENGTH && onScan) {
                onScan(barcode);
            }
        },
        [onScan]
    );

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            // Ignore events from input/textarea/select elements
            const tag = e.target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
                return;
            }

            const now = Date.now();

            if (e.key === "Enter") {
                e.preventDefault();
                const barcode = bufferRef.current.trim();
                bufferRef.current = "";
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
                handleBarcode(barcode);
                return;
            }

            // Only accept printable single characters
            if (e.key.length !== 1) return;

            const elapsed = now - lastKeyTimeRef.current;
            lastKeyTimeRef.current = now;

            // If too much time passed, start fresh
            if (elapsed > CHAR_INTERVAL_MS && bufferRef.current.length > 0) {
                bufferRef.current = "";
            }

            bufferRef.current += e.key;

            // Reset timer for auto-clear after inactivity
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                bufferRef.current = "";
                timerRef.current = null;
            }, CHAR_INTERVAL_MS * 3);
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            bufferRef.current = "";
        };
    }, [enabled, handleBarcode]);
};
