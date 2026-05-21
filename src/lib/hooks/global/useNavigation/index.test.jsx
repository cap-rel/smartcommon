import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";

// Mock the context hook so the test does not need the full provider stack
// (libConfig, gst, etc.). NavigationProvider just wraps children with this
// value; useNavigation() reads it via useContext and adds useParams() on top.
vi.mock("lib/hooks/global/useNavigation/context", () => ({
    useNavigationContext: () => ({
        location: { pathname: "/", state: {} },
        navigate: vi.fn(),
    }),
}));

import { NavigationProvider } from "lib/components/app/NavigationProvider";
import { useNavigation } from "./index";

const ParamsProbe = () => {
    const nav = useNavigation();
    return <span data-testid="params">{JSON.stringify(nav.params)}</span>;
};

describe("useNavigation - route params resolution", () => {
    // Regression: params used to be read by useNavigationContext above
    // <Routes>, which always returned {}. They are now read by
    // useNavigation() itself in the leaf component.
    it("resolves params declared by the active <Route>", () => {
        render(
            <MemoryRouter initialEntries={["/x/42"]}>
                <NavigationProvider>
                    <Routes>
                        <Route path="/x/:id" element={<ParamsProbe />} />
                    </Routes>
                </NavigationProvider>
            </MemoryRouter>
        );
        expect(screen.getByTestId("params").textContent).toBe(
            JSON.stringify({ id: "42" })
        );
    });

    it("returns {} when used outside a parameterized route", () => {
        render(
            <MemoryRouter initialEntries={["/home"]}>
                <NavigationProvider>
                    <ParamsProbe />
                </NavigationProvider>
            </MemoryRouter>
        );
        expect(screen.getByTestId("params").textContent).toBe("{}");
    });
});
