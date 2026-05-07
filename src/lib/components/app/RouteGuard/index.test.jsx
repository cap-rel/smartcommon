import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const { fakeApi } = vi.hoisted(() => ({
    fakeApi: { user: undefined },
}));

vi.mock("lib/hooks/global/useApi", () => ({
    useApi: () => fakeApi,
    useApiContext: () => fakeApi,
}));

import { RouteGuard } from "./index";

const renderAt = (initial, ui) =>
    render(
        <MemoryRouter initialEntries={[initial]}>
            <Routes>
                <Route path="/login" element={<p>login page</p>} />
                <Route path="/" element={<p>home page</p>} />
                <Route path="/dashboard" element={ui} />
                <Route path="/custom-redirect" element={<p>custom destination</p>} />
            </Routes>
        </MemoryRouter>
    );

describe("RouteGuard", () => {
    let consoleWarnSpy;

    beforeEach(() => {
        fakeApi.user = undefined;
        consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    describe("neutral mode (no constraint)", () => {
        it("renders children as-is when neither requireAuth nor requireGuest is set", () => {
            renderAt(
                "/dashboard",
                <RouteGuard>
                    <p>protected content</p>
                </RouteGuard>
            );
            expect(screen.getByText("protected content")).toBeDefined();
        });
    });

    describe("requireAuth", () => {
        it("redirects unauthenticated users to /login by default", () => {
            fakeApi.user = undefined;
            renderAt(
                "/dashboard",
                <RouteGuard requireAuth>
                    <p>protected content</p>
                </RouteGuard>
            );
            expect(screen.getByText("login page")).toBeDefined();
            expect(screen.queryByText("protected content")).toBeNull();
        });

        it("renders children when user is authenticated", () => {
            fakeApi.user = { id: 1, email: "u@x.com" };
            renderAt(
                "/dashboard",
                <RouteGuard requireAuth>
                    <p>protected content</p>
                </RouteGuard>
            );
            expect(screen.getByText("protected content")).toBeDefined();
        });

        it("uses a custom redirectTo when provided", () => {
            fakeApi.user = undefined;
            renderAt(
                "/dashboard",
                <RouteGuard requireAuth redirectTo="/custom-redirect">
                    <p>protected content</p>
                </RouteGuard>
            );
            expect(screen.getByText("custom destination")).toBeDefined();
        });
    });

    describe("requireGuest", () => {
        it("redirects authenticated users to / by default", () => {
            fakeApi.user = { id: 1 };
            renderAt(
                "/dashboard",
                <RouteGuard requireGuest>
                    <p>guest-only content</p>
                </RouteGuard>
            );
            expect(screen.getByText("home page")).toBeDefined();
            expect(screen.queryByText("guest-only content")).toBeNull();
        });

        it("renders children when no user is authenticated", () => {
            fakeApi.user = undefined;
            renderAt(
                "/dashboard",
                <RouteGuard requireGuest>
                    <p>guest-only content</p>
                </RouteGuard>
            );
            expect(screen.getByText("guest-only content")).toBeDefined();
        });

        it("uses a custom redirectTo when provided", () => {
            fakeApi.user = { id: 1 };
            renderAt(
                "/dashboard",
                <RouteGuard requireGuest redirectTo="/custom-redirect">
                    <p>guest-only content</p>
                </RouteGuard>
            );
            expect(screen.getByText("custom destination")).toBeDefined();
        });
    });

    describe("conflict (both requireAuth and requireGuest)", () => {
        it("falls back to requireAuth and warns", () => {
            fakeApi.user = undefined;
            renderAt(
                "/dashboard",
                <RouteGuard requireAuth requireGuest>
                    <p>conflicted content</p>
                </RouteGuard>
            );
            expect(screen.getByText("login page")).toBeDefined();
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringMatching(/RouteGuard.*both/i)
            );
        });

        it("still allows authenticated users when both flags are set (auth wins)", () => {
            fakeApi.user = { id: 1 };
            renderAt(
                "/dashboard",
                <RouteGuard requireAuth requireGuest>
                    <p>conflicted content</p>
                </RouteGuard>
            );
            expect(screen.getByText("conflicted content")).toBeDefined();
        });
    });

    describe("Outlet fallback", () => {
        it("renders <Outlet /> when used as a route element without children", () => {
            // Pattern react-router v6/v7: <Route element={<RouteGuard ... />}>
            // The guard delegates to <Outlet /> which renders the matched
            // child route. Here /dashboard is nested under the guard route.
            fakeApi.user = { id: 1 };
            render(
                <MemoryRouter initialEntries={["/dashboard"]}>
                    <Routes>
                        <Route element={<RouteGuard requireAuth />}>
                            <Route path="/dashboard" element={<p>nested content</p>} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            );
            expect(screen.getByText("nested content")).toBeDefined();
        });

        it("redirects from <Outlet /> when used as a route element and not authorised", () => {
            fakeApi.user = undefined;
            render(
                <MemoryRouter initialEntries={["/dashboard"]}>
                    <Routes>
                        <Route element={<RouteGuard requireAuth />}>
                            <Route path="/dashboard" element={<p>nested content</p>} />
                        </Route>
                        <Route path="/login" element={<p>login page</p>} />
                    </Routes>
                </MemoryRouter>
            );
            expect(screen.getByText("login page")).toBeDefined();
            expect(screen.queryByText("nested content")).toBeNull();
        });
    });
});
