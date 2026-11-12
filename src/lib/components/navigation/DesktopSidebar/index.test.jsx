import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FaHouse, FaUsers, FaGear, FaInbox } from "react-icons/fa6";

import { DesktopSidebar } from "./index";
import { NavigationContext } from "lib/components/app/NavigationProvider/context";
import { fr } from "lib/locales/fr";

const STORAGE_KEY = "smartcommon.desktopSidebar.collapsed";

const LINKS = [
    { id: "home", label: "Home", icon: FaHouse, to: "/" },
    { id: "clients", label: "Clients", icon: FaUsers, to: "/clients", badge: 3 },
    { id: "settings", label: "Settings", icon: FaGear, to: "/settings" },
];

const renderSidebar = (props = {}, pathname = "/clients/42") => render(
    <MemoryRouter initialEntries={[pathname]}>
        <NavigationContext.Provider value={{ location: { pathname } }}>
            <DesktopSidebar links={LINKS} {...props} />
        </NavigationContext.Provider>
    </MemoryRouter>
);

describe("DesktopSidebar - navigation", () => {
    beforeEach(() => window.localStorage.clear());

    it("is a named nav landmark with a list of links", () => {
        renderSidebar();
        const nav = screen.getByRole("navigation", { name: "Main navigation" });
        expect(nav.querySelectorAll("li")).toHaveLength(3);
        expect(screen.getByRole("link", { name: /Clients/ }).getAttribute("href")).toBe("/clients");
    });

    it("marks the link of the current route, sub-routes included", () => {
        renderSidebar({}, "/clients/42");
        expect(screen.getByRole("link", { name: /Clients/ }).getAttribute("aria-current")).toBe("page");
        expect(screen.getByRole("link", { name: "Home" }).hasAttribute("aria-current")).toBe(false);
    });

    it("matches / on the home route only", () => {
        renderSidebar({}, "/");
        expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe("page");
        expect(screen.getByRole("link", { name: /Clients/ }).hasAttribute("aria-current")).toBe(false);
    });

    it("renders a link without `to` as a button calling onClick", () => {
        const onClick = vi.fn();
        renderSidebar({ links: [{ id: "inbox", label: "Inbox", icon: FaInbox, onClick }] });
        fireEvent.click(screen.getByRole("button", { name: "Inbox" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("pins a badge on the icon glyph", () => {
        renderSidebar();
        const badge = screen.getByTestId("badge");
        expect(badge.textContent).toBe("3");
        expect(badge.parentElement.className).toContain("relative");
        expect(badge.parentElement.querySelector("svg")).not.toBeNull();
    });

    it("translates its landmark and button through the locale bundle", () => {
        renderSidebar({ labels: fr.DesktopSidebar });
        expect(screen.getByRole("navigation", { name: "Navigation principale" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Réduire le menu" })).toBeTruthy();
    });
});

describe("DesktopSidebar - collapse", () => {
    beforeEach(() => window.localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it("collapses to icons, keeps the links named and persists the state", () => {
        renderSidebar();
        const toggle = screen.getByRole("button", { name: "Collapse menu" });
        expect(toggle.getAttribute("aria-expanded")).toBe("true");

        fireEvent.click(toggle);

        const expand = screen.getByRole("button", { name: "Expand menu" });
        expect(expand.getAttribute("aria-expanded")).toBe("false");
        expect(screen.getByTestId("desktop-sidebar").className).toContain("w-16");
        expect(screen.queryByText("Settings")).toBeNull();
        expect(screen.getByRole("link", { name: "Settings" }).getAttribute("title")).toBe("Settings");
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe("1");
    });

    it("starts from the stored state after a reload", () => {
        window.localStorage.setItem(STORAGE_KEY, "1");
        renderSidebar();
        expect(screen.getByTestId("desktop-sidebar").getAttribute("data-collapsed")).toBe("true");
    });

    it("lets the parent own the state without touching the storage", () => {
        const onCollapsedChange = vi.fn();
        renderSidebar({ collapsed: false, onCollapsedChange });
        fireEvent.click(screen.getByRole("button", { name: "Collapse menu" }));
        expect(onCollapsedChange).toHaveBeenCalledWith(true);
        expect(screen.getByTestId("desktop-sidebar").getAttribute("data-collapsed")).toBe("false");
        expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("does not persist with storageKey null", () => {
        renderSidebar({ storageKey: null });
        fireEvent.click(screen.getByRole("button", { name: "Collapse menu" }));
        expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it("falls back to the default and logs when the storage is unavailable", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.spyOn(window.localStorage, "getItem").mockImplementation(() => { throw new Error("denied"); });
        renderSidebar({ defaultCollapsed: true });
        expect(screen.getByTestId("desktop-sidebar").getAttribute("data-collapsed")).toBe("true");
        expect(warn).toHaveBeenCalled();
    });

    it("renders brand and footer, as nodes or from the collapse state", () => {
        renderSidebar({
            brand: ({ collapsed }) => (collapsed ? "SI" : "SmartInter"),
            footer: <span>v1.0</span>,
        });
        expect(screen.getByText("SmartInter")).toBeTruthy();
        expect(screen.getByText("v1.0")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Collapse menu" }));
        expect(screen.getByText("SI")).toBeTruthy();
    });
});
