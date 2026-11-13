import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { renderHook, act } from "@testing-library/react";

// Only the library config is replaced: the hook reads its debug flags.
vi.mock("lib/hooks", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useLibConfig: () => ({}) };
});

import { useNavigationContext } from "./context";

const wrapper = ({ children }) => <MemoryRouter initialEntries={["/home"]}>{children}</MemoryRouter>;

describe("useNavigationContext history", () => {
    it("starts with the current location", () => {
        const { result } = renderHook(() => useNavigationContext(), { wrapper });

        expect(result.current.history.map((l) => l.pathname)).toEqual(["/home"]);
    });

    it("records each visited location once, oldest first", () => {
        const { result, rerender } = renderHook(() => useNavigationContext(), { wrapper });

        act(() => result.current.to("/clients"));
        act(() => result.current.to("/clients/42"));
        rerender();

        expect(result.current.history.map((l) => l.pathname)).toEqual(["/home", "/clients", "/clients/42"]);
    });

    it("keeps the last 50 locations", () => {
        const { result } = renderHook(() => useNavigationContext(), { wrapper });

        for (let i = 0; i < 60; i++) {
            act(() => result.current.to(`/page/${i}`));
        }

        expect(result.current.history).toHaveLength(50);
        expect(result.current.history.at(-1).pathname).toBe("/page/59");
    });
});
