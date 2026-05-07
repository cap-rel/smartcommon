import { describe, it, expect, vi } from "vitest";
import { useContext } from "react";
import { render, renderHook, screen } from "@testing-library/react";

const { fakeNav } = vi.hoisted(() => ({
    fakeNav: {
        location: { pathname: "/home", state: {} },
        params: {},
        navigate: vi.fn(),
    },
}));

// Mock the source module directly (not the barrel) so the mock is robust
// to vitest's isolate:false module-cache sharing across test files.
vi.mock("lib/hooks/global/useNavigation/context", () => ({
    useNavigationContext: () => fakeNav,
}));

import { NavigationProvider } from "./index";
import { NavigationContext } from "./context";

describe("NavigationProvider", () => {
    it("renders its children", () => {
        render(
            <NavigationProvider>
                <p>nav child</p>
            </NavigationProvider>
        );

        expect(screen.getByText("nav child")).toBeDefined();
    });

    it("exposes the navigation context to consumers (mocked hook)", () => {
        const wrapper = ({ children }) => (
            <NavigationProvider>{children}</NavigationProvider>
        );

        const { result } = renderHook(() => useContext(NavigationContext), { wrapper });

        expect(result.current.location.pathname).toBe("/home");
        expect(typeof result.current.navigate).toBe("function");
    });
});
