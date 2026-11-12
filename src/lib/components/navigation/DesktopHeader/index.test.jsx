import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { DesktopHeader } from "./index";
import { GlobalStatesContext } from "lib/components/app/GlobalStatesProvider/context";
import { fr } from "lib/locales/fr";

const withUser = (ui) => (
    <GlobalStatesContext.Provider value={{ get: () => ({ username: "manon" }) }}>
        {ui}
    </GlobalStatesContext.Provider>
);

describe("DesktopHeader", () => {
    it("renders the title as the page h1 with its subtitle and breadcrumb", () => {
        render(withUser(<DesktopHeader title="Invoices" subtitle="42 open" breadcrumb={<nav aria-label="Breadcrumb">Home</nav>} />));
        expect(screen.getByRole("heading", { level: 1, name: "Invoices" })).toBeTruthy();
        expect(screen.getByText("42 open")).toBeTruthy();
        expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    });

    it("pins the UserMenu on the right unless showUserMenu is false", () => {
        const { rerender } = render(withUser(<DesktopHeader title="Invoices" />));
        expect(screen.getByTestId("user-menu-trigger")).toBeTruthy();
        rerender(withUser(<DesktopHeader title="Invoices" showUserMenu={false} />));
        expect(screen.queryByTestId("user-menu-trigger")).toBeNull();
    });

    it("forwards UserMenu props", () => {
        render(withUser(<DesktopHeader title="Invoices" UserMenu={{ labels: fr.UserMenu }} />));
        fireEvent.click(screen.getByTestId("user-menu-trigger"));
        expect(screen.getByRole("menuitem", { name: "Réglages" })).toBeTruthy();
    });

    it("shows a named back button only with onBack", () => {
        const onBack = vi.fn();
        const { rerender } = render(withUser(<DesktopHeader title="Invoice 42" />));
        expect(screen.queryByTestId("desktop-header-back")).toBeNull();

        rerender(withUser(<DesktopHeader title="Invoice 42" onBack={onBack} labels={fr.DesktopHeader} />));
        fireEvent.click(screen.getByRole("button", { name: "Retour" }));
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it("places the search and the page actions", () => {
        render(withUser(
            <DesktopHeader
                title="Invoices"
                search={<input aria-label="Search invoices" />}
                actions={<button type="button">New invoice</button>}
                data-testid="page-header"
            />
        ));
        expect(screen.getByLabelText("Search invoices")).toBeTruthy();
        expect(screen.getByRole("button", { name: "New invoice" })).toBeTruthy();
        const header = screen.getByTestId("page-header");
        expect(header.tagName).toBe("HEADER");
        expect(header.className).toContain("border-b");
        expect(header.className).not.toMatch(/shadow/);
    });
});
