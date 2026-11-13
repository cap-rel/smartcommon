import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("lib/hooks", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useLibConfig: () => ({}) };
});

import { local, session } from "lib/utils";

import { useGlobalStatesContext } from "./context";

describe("useGlobalStatesContext", () => {
    beforeEach(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    it("uses initialStates as defaults under the stored values", () => {
        local.set("global", { theme: "dark" });

        const { result } = renderHook(() => useGlobalStatesContext({ initialStates: { theme: "light", count: 0 } }));

        expect(result.current.get("theme")).toBe("dark");
        expect(result.current.get("count")).toBe(0);
    });

    it("stores the result of an updater function, not the function", () => {
        const { result } = renderHook(() => useGlobalStatesContext());

        act(() => result.current.local.set("count", 1));
        act(() => result.current.local.set("count", (prev) => prev + 1));

        expect(result.current.get("count")).toBe(2);
        expect(local.get("global")).toEqual({ count: 2 });
    });

    it("unsets a stored path without touching a sibling sharing its prefix", () => {
        const { result } = renderHook(() => useGlobalStatesContext());

        act(() => result.current.session.set("first", "a"));
        act(() => result.current.session.set("firstname", "Ada"));
        act(() => result.current.unset("first"));

        expect(session.get("global")).toEqual({ firstname: "Ada" });
        expect(result.current.get("firstname")).toBe("Ada");
    });
});
