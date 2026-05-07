import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

// Import the context source first so the circular barrel resolution
// (lib/components -> ApiProvider -> lib/hooks -> useApi -> lib/components)
// always finds ApiContext defined when useApi is evaluated.
import "lib/components/app/ApiProvider/context";
import { useApi } from "./index";

describe("useApi", () => {
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
});
