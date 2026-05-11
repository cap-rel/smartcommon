import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Background
// ----------
// In production (capTodo PWA build), the consumer's app mounts its own
// <BrowserRouter> inside the smartcommon <Provider>, which itself mounts a
// <BrowserRouter>. smartcommon/vite.config.js does NOT externalize
// react-router-dom (only react, react-dom, react-hot-toast are external),
// so the published smartcommon bundle ships its own copy of react-router-dom.
// Result: two react-router-dom module instances, two RouteContext objects.
//   - The OUTER <BrowserRouter> uses smartcommon's bundled copy.
//   - The INNER <BrowserRouter> + <Routes> use the consumer's copy.
//   - <RouteGuard> sits in smartcommon's bundle, so its <Outlet /> reads
//     smartcommon's RouteContext, which is never populated by the consumer
//     <Routes>. <Outlet /> renders null -> page blanche, no error.
// The invariant `You cannot render a <Router> inside another <Router>` does
// NOT fire because `useInRouterContext()` reads smartcommon's context (only
// the outer set it) while the inner BrowserRouter reads the consumer's
// (empty) context.
//
// In vitest, react-router-dom resolves to a single module record. Real
// nesting hits the invariant first, so the production bug cannot be
// reproduced that way. To isolate it we mock react-router-dom and swap ONLY
// Outlet for a hand-written shadow that owns a fresh RouteContext: this
// simulates "RouteGuard renders an Outlet from a second copy of
// react-router-dom whose RouteContext nobody populates". The test's outer
// routes go through `vi.importActual` so they keep the real internals.

const { fakeApi, shadow } = vi.hoisted(() => {
    const React = require("react");

    // Fresh RouteContext, distinct from the real react-router-dom's.
    // Simulates "another bundle's copy" of react-router-dom: its Outlet only
    // reads from this private context, which the real outer <Routes> never
    // touches.
    const ShadowRouteContext = React.createContext({
        outlet: null,
        matches: [],
        isDataRoute: false,
    });

    const ShadowOutlet = () => {
        const ctx = React.useContext(ShadowRouteContext);
        return ctx?.outlet ?? null;
    };

    return {
        fakeApi: { user: undefined },
        shadow: { Outlet: ShadowOutlet },
    };
});

vi.mock("lib/hooks/global/useApi", () => ({
    useApi: () => fakeApi,
    useApiContext: () => fakeApi,
}));

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        Outlet: shadow.Outlet,
    };
});

// Real react-router-dom internals for the test's outer routes and the
// hand-rolled comparison guard. Resolved via importActual so they are
// untouched by the vi.mock above.
const real = await vi.importActual("react-router-dom");
const { MemoryRouter, Navigate, Outlet: RealOutlet, Route, Routes } = real;

import { useApi } from "lib/hooks/global/useApi";
import { RouteGuard } from "./index";

const LoginMarker = () => <div data-testid="login-marker">LOGIN</div>;

// Hand-rolled equivalent of RouteGuard requireGuest, using the REAL Outlet.
// In production this matches the "custom local layout" the user tried, which
// makes the bug disappear.
const LocalGuestGuard = () => {
    const api = useApi();
    return api?.user ? <Navigate to="/" replace /> : <RealOutlet />;
};

describe("RouteGuard - dual-bundle Outlet scenario", () => {
    let consoleWarnSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        fakeApi.user = undefined;
        consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it("control: RouteGuard works when its Outlet shares the RouteContext with the surrounding <Routes>", async () => {
        // Re-import RouteGuard with the react-router-dom mock disabled, so
        // RouteGuard's internal <Outlet /> resolves to the real one. This is
        // the "single bundle" baseline equivalent of how the consumer would
        // see RouteGuard before adding their own nested BrowserRouter from a
        // different bundle.
        vi.doUnmock("react-router-dom");
        vi.resetModules();
        const { RouteGuard: RouteGuardReal } = await import("./index");
        const { useApi: useApiReal } = await import("lib/hooks/global/useApi");
        // Sanity: re-imported useApi still resolves to the mocked fakeApi.
        expect(useApiReal()).toBe(fakeApi);

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route element={<RouteGuardReal requireGuest />}>
                        <Route path="/login" element={<LoginMarker />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.queryByTestId("login-marker")).not.toBeNull();

        // Restore the file-level mock for the remaining tests.
        vi.doMock("react-router-dom", async (importOriginal) => {
            const actual = await importOriginal();
            return { ...actual, Outlet: shadow.Outlet };
        });
        vi.resetModules();
    });

    it("comparison: hand-rolled guard (uses real Outlet) renders the matched child route", () => {
        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route element={<LocalGuestGuard />}>
                        <Route path="/login" element={<LoginMarker />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.queryByTestId("login-marker")).not.toBeNull();
    });

    // `it.fails` flips the pass/fail semantic: the assertion below is for the
    // FIXED behaviour (child route renders), but the bug structurally cannot
    // be fixed inside RouteGuard's source -- only the smartcommon BUILD config
    // (externalize react-router/react-router-dom) keeps the dual-bundle from
    // happening in the first place. We keep this test as a regression marker:
    // if some future change accidentally bundles a second copy of
    // react-router-dom, the underlying issue would reappear, but vitest can
    // never reproduce it with a single resolved module. Marking it `it.fails`
    // documents the situation and keeps CI green.
    it.fails("repro: RouteGuard renders a shadow Outlet whose RouteContext is never populated -> child route lost", () => {
        // Outer routes come from the real react-router-dom; RouteGuard's
        // internal `Outlet` was swapped by vi.mock for the shadow Outlet,
        // simulating "RouteGuard belongs to a different bundle". The
        // expected (fixed) behaviour is that the child route renders. With
        // the bug present, queryByTestId returns null and this fails.
        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route element={<RouteGuard requireGuest />}>
                        <Route path="/login" element={<LoginMarker />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.queryByTestId("login-marker")).not.toBeNull();
    });
});
