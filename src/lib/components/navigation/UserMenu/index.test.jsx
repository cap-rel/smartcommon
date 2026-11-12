import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { UserMenu } from "./index";
import { ApiContext } from "lib/components/app/ApiProvider/context";
import { GlobalStatesContext } from "lib/components/app/GlobalStatesProvider/context";
import { NavigationContext } from "lib/components/app/NavigationProvider/context";
import { fr } from "lib/locales/fr";

const renderWithApp = (ui, { user = { username: "manon" }, logout = vi.fn(() => Promise.resolve()), to = vi.fn() } = {}) => {
    render(
        <ApiContext.Provider value={{ logout }}>
            <GlobalStatesContext.Provider value={{ get: (key) => (key === "user" ? user : undefined) }}>
                <NavigationContext.Provider value={{ replace: () => ({ to }) }}>
                    {ui}
                </NavigationContext.Provider>
            </GlobalStatesContext.Provider>
        </ApiContext.Provider>
    );
    return { logout, to };
};

describe("UserMenu", () => {
    it("shows the user from the global state and opens Settings and Log out", () => {
        renderWithApp(<UserMenu />);
        const trigger = screen.getByRole("button", { name: "manon" });
        expect(trigger.getAttribute("data-testid")).toBe("user-menu-trigger");
        expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
        expect(trigger.textContent).toContain("MA");

        fireEvent.click(trigger);
        expect(screen.getByRole("menu", { name: "manon" })).toBeTruthy();
        expect(screen.getByTestId("user-menu-settings").textContent).toContain("Settings");
        expect(screen.getByTestId("user-menu-logout").textContent).toContain("Log out");
    });

    it("navigates to the settings path", () => {
        const { to } = renderWithApp(<UserMenu settingsPath="/preferences" />);
        fireEvent.click(screen.getByRole("button", { name: "manon" }));
        fireEvent.click(screen.getByTestId("user-menu-settings"));
        expect(to).toHaveBeenCalledWith("/preferences");
    });

    it("logs out through useApi with an abort signal", async () => {
        const { logout } = renderWithApp(<UserMenu />);
        fireEvent.click(screen.getByRole("button", { name: "manon" }));
        fireEvent.click(screen.getByTestId("user-menu-logout"));
        await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
        expect(logout.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
    });

    it("prefers the onSettings and onLogout props", async () => {
        const onSettings = vi.fn();
        const onLogout = vi.fn();
        const { to, logout } = renderWithApp(<UserMenu onSettings={onSettings} onLogout={onLogout} />);
        fireEvent.click(screen.getByRole("button", { name: "manon" }));
        fireEvent.click(screen.getByTestId("user-menu-settings"));
        fireEvent.click(screen.getByRole("button", { name: "manon" }));
        fireEvent.click(screen.getByTestId("user-menu-logout"));
        await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
        expect(onSettings).toHaveBeenCalledTimes(1);
        expect(to).not.toHaveBeenCalled();
        expect(logout).not.toHaveBeenCalled();
    });

    it("adds custom entries between Settings and Log out", () => {
        renderWithApp(<UserMenu items={[{ key: "profile", label: "Profile", onClick: () => {} }]} />);
        fireEvent.click(screen.getByRole("button", { name: "manon" }));
        const names = screen.getAllByRole("menuitem").map((item) => item.textContent);
        expect(names).toEqual(["Settings", "Profile", "Log out"]);
    });

    it("translates its entries through the locale bundle", () => {
        renderWithApp(<UserMenu labels={fr.UserMenu} />);
        fireEvent.click(screen.getByRole("button", { name: "manon" }));
        expect(screen.getByRole("menuitem", { name: "Réglages" })).toBeTruthy();
        expect(screen.getByRole("menuitem", { name: "Déconnexion" })).toBeTruthy();
    });

    it("names the trigger Account when the user has no name", () => {
        renderWithApp(<UserMenu />, { user: {} });
        expect(screen.getByRole("button", { name: "Account" })).toBeTruthy();
    });
});
