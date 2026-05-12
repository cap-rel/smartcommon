import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useBarcodeScanner } from "./";

// Helpers ----------------------------------------------------------------
const fireKey = (key, target) => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    if (target) {
        Object.defineProperty(event, "target", { value: target });
    }
    document.dispatchEvent(event);
};

const advanceNow = (ms) => {
    vi.setSystemTime(new Date(Date.now() + ms));
};

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
});

afterEach(() => {
    vi.useRealTimers();
});

describe("useBarcodeScanner", () => {
    it("fires onScan when 6 chars are typed quickly then Enter", () => {
        const onScan = vi.fn();
        renderHook(() => useBarcodeScanner({ onScan }));

        act(() => {
            for (const c of "123456") {
                advanceNow(10); // < 50ms between keys = scanner-fast
                fireKey(c);
            }
            fireKey("Enter");
        });

        expect(onScan).toHaveBeenCalledWith("123456");
    });

    it("ignores slow human-typed input (> 50ms between keys)", () => {
        const onScan = vi.fn();
        renderHook(() => useBarcodeScanner({ onScan }));

        act(() => {
            for (const c of "123456") {
                advanceNow(200); // human typing speed
                fireKey(c);
            }
            fireKey("Enter");
        });

        // Buffer is reset between each slow key, so by Enter only the last
        // char is left and length < MIN_BARCODE_LENGTH.
        expect(onScan).not.toHaveBeenCalled();
    });

    it("clears the buffer after 150ms of inactivity", () => {
        const onScan = vi.fn();
        renderHook(() => useBarcodeScanner({ onScan }));

        act(() => {
            for (const c of "ABC") {
                advanceNow(10);
                fireKey(c);
            }
            // Now wait > 150ms without typing -> buffer should clear via setTimeout
            vi.advanceTimersByTime(200);
            // Re-arm: type a different sequence and Enter
            for (const c of "XYZ") {
                advanceNow(10);
                fireKey(c);
            }
            fireKey("Enter");
        });

        // The Enter scans only "XYZ", which is below MIN_BARCODE_LENGTH (4)
        expect(onScan).not.toHaveBeenCalled();
    });

    it("ignores keydown events originating from INPUT elements", () => {
        const onScan = vi.fn();
        renderHook(() => useBarcodeScanner({ onScan }));

        const input = document.createElement("input");
        document.body.appendChild(input);

        act(() => {
            for (const c of "123456") {
                advanceNow(10);
                fireKey(c, input);
            }
            fireKey("Enter", input);
        });

        expect(onScan).not.toHaveBeenCalled();
        document.body.removeChild(input);
    });

    it("ignores barcodes shorter than 4 characters", () => {
        const onScan = vi.fn();
        renderHook(() => useBarcodeScanner({ onScan }));

        act(() => {
            for (const c of "12") {
                advanceNow(10);
                fireKey(c);
            }
            fireKey("Enter");
        });

        expect(onScan).not.toHaveBeenCalled();
    });

    it("does not attach a listener when enabled is false", () => {
        const onScan = vi.fn();
        renderHook(() => useBarcodeScanner({ onScan, enabled: false }));

        act(() => {
            for (const c of "123456") {
                advanceNow(10);
                fireKey(c);
            }
            fireKey("Enter");
        });

        expect(onScan).not.toHaveBeenCalled();
    });

    it("ignores non-printable keys (length > 1) silently", () => {
        const onScan = vi.fn();
        renderHook(() => useBarcodeScanner({ onScan }));

        act(() => {
            advanceNow(10);
            fireKey("1");
            advanceNow(10);
            fireKey("Shift"); // multi-char keys are ignored
            advanceNow(10);
            fireKey("2");
            advanceNow(10);
            fireKey("3");
            advanceNow(10);
            fireKey("4");
            fireKey("Enter");
        });

        expect(onScan).toHaveBeenCalledWith("1234");
    });
});
