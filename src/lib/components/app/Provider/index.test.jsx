import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Provider mounts the full stack (Error + LibConfig + Redux + GlobalStates +
// Api + Router + Navigation). Mock the heavy hooks so the smoke test does
// not need a real backend, deviceId, JWT etc.
vi.mock("lib/hooks/global/useApi/context", () => ({
    useApiContext: () => ({}),
}));

vi.mock("lib/hooks/global/useGlobalStates/context", () => ({
    useGlobalStatesContext: () => ({
        values: {},
        set: vi.fn(),
        unset: vi.fn(),
        local: { set: vi.fn() },
        session: { set: vi.fn() },
    }),
}));

vi.mock("lib/hooks/global/useNavigation/context", () => ({
    useNavigationContext: () => ({
        location: { pathname: "/", state: {} },
        navigate: vi.fn(),
    }),
}));

import { Provider } from "./index";

describe("Provider", () => {
    it("renders its children with a minimal config", () => {
        render(
            <Provider config={{}}>
                <p data-testid="provider-child">child rendered</p>
            </Provider>
        );

        expect(screen.getByTestId("provider-child").textContent).toBe("child rendered");
    });

    it("does not throw when mounted without children", () => {
        expect(() => render(<Provider config={{}} />)).not.toThrow();
    });

    it("does not crash with debug=true (mounts DebugConsole + DebugWarnings)", () => {
        expect(() =>
            render(
                <Provider config={{}} debug>
                    <p>debug child</p>
                </Provider>
            )
        ).not.toThrow();
    });
});
