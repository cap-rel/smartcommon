import { describe, it, expect, vi } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";

const { fakeApi } = vi.hoisted(() => ({
    fakeApi: {
        user: { id: 7, name: "alice" },
        get: () => {},
        post: () => {},
    },
}));

vi.mock("lib/hooks", () => ({
    useApiContext: () => fakeApi,
    // Re-expose useApi from the real module so consumers in tests still work
    useApi: () => fakeApi,
}));

import { ApiProvider } from "./index";
import { useApi } from "lib/hooks";

describe("ApiProvider", () => {
    it("renders its children", () => {
        render(
            <ApiProvider>
                <p>api child</p>
            </ApiProvider>
        );

        expect(screen.getByText("api child")).toBeDefined();
    });

    it("does not throw when mounted with empty children", () => {
        expect(() => render(<ApiProvider />)).not.toThrow();
    });

    it("exposes the api context value to consumers via useApi (mocked)", () => {
        const wrapper = ({ children }) => <ApiProvider>{children}</ApiProvider>;

        const { result } = renderHook(() => useApi(), { wrapper });

        expect(result.current.user).toEqual({ id: 7, name: "alice" });
        expect(typeof result.current.get).toBe("function");
        expect(typeof result.current.post).toBe("function");
    });
});
