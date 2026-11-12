/**
 * useStates({ isLoading: true }) looks like an initial state but is read as
 * options: the state started empty with no hint. Unknown option names are now
 * reported once per distinct set, naming the expected form.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useStates } from "lib/hooks";

const warnings = (spy) => spy.mock.calls
    .map((args) => args.join(" "))
    .filter((text) => text.includes("useStates") && text.includes("Unknown option"));

describe("useStates - unknown options", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("warns, naming the unknown keys and the expected form", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const { result } = renderHook(() => useStates({ isLoading: true, items: [] }));

        expect(result.current.states).toEqual({});
        const messages = warnings(warn);
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain("\"isLoading\"");
        expect(messages[0]).toContain("\"items\"");
        expect(messages[0]).toContain("useStates({ initialStates: {...} })");
    });

    it("warns once for the same set of keys, across renders and components", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const { rerender } = renderHook(() => useStates({ isOpen: false }));
        rerender();
        rerender();
        renderHook(() => useStates({ isOpen: true }));

        expect(warnings(warn)).toHaveLength(1);
    });

    it("warns again for a different set of keys", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        renderHook(() => useStates({ count: 0 }));
        renderHook(() => useStates({ count: 0, total: 0 }));

        expect(warnings(warn)).toHaveLength(2);
    });

    it("stays silent for initialStates and debug", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const { result } = renderHook(() => useStates({ initialStates: { isLoading: true }, debug: false }));

        expect(result.current.states).toEqual({ isLoading: true });
        expect(warnings(warn)).toEqual([]);
    });
});
