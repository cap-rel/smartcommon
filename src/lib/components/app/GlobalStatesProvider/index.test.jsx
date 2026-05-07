import { describe, it, expect, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";

const { fakeGst } = vi.hoisted(() => ({
    fakeGst: {
        values: { foo: "bar" },
        set: vi.fn(),
        unset: vi.fn(),
        local: { set: vi.fn() },
        session: { set: vi.fn() },
    },
}));

vi.mock("lib/hooks", () => ({
    useGlobalStatesContext: () => fakeGst,
    useGlobalStates: () => fakeGst,
}));

import { GlobalStatesProvider } from "./index";
import { useGlobalStates } from "lib/hooks";

describe("GlobalStatesProvider", () => {
    it("renders its children", () => {
        render(
            <GlobalStatesProvider>
                <p>gst child</p>
            </GlobalStatesProvider>
        );

        expect(screen.getByText("gst child")).toBeDefined();
    });

    it("exposes the global states context to consumers (mocked hook)", () => {
        const wrapper = ({ children }) => (
            <GlobalStatesProvider>{children}</GlobalStatesProvider>
        );

        const { result } = renderHook(() => useGlobalStates(), { wrapper });

        expect(result.current.values).toEqual({ foo: "bar" });
        expect(typeof result.current.set).toBe("function");
        expect(typeof result.current.unset).toBe("function");
    });
});
