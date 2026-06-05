import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Import the context source first so the circular barrel resolution
// (lib/components -> ApiProvider -> lib/hooks -> useApi -> lib/components)
// always finds ApiContext defined when useApi is evaluated.
import "lib/components/app/ApiProvider/context";
import { log } from "lib/utils";
import { useApi } from "./index";

describe("useApi", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns an empty object when used outside ApiProvider", () => {
        const { result } = renderHook(() => useApi());

        expect(result.current).toEqual({});
    });

    it("does not throw when called outside any provider", () => {
        expect(() => renderHook(() => useApi())).not.toThrow();
    });

    it("returns a stable reference between renders without provider", () => {
        const { result, rerender } = renderHook(() => useApi());
        const first = result.current;
        rerender();
        expect(result.current).toEqual(first);
    });

    it("logs an error (no silent failure) when used outside provider", () => {
        const spy = vi.spyOn(log, "error").mockImplementation(() => {});

        renderHook(() => useApi());

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toMatch(/outside of an <ApiProvider>/i);
    });

    it("does not re-log on re-render of the same consumer", () => {
        const spy = vi.spyOn(log, "error").mockImplementation(() => {});

        const { rerender } = renderHook(() => useApi());
        rerender();
        rerender();

        // Guarded by a per-consumer ref: warns once, not on every render.
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
