import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FaHouse, FaGear } from "react-icons/fa6";

import { Sidebar } from "./";

const renderSidebar = (props) => render(
    <MemoryRouter>
        <Sidebar id="main-sidebar" Panel={{ isOpen: true }} { ...props } />
    </MemoryRouter>
);

describe("Sidebar - links", () => {
    it("renders every link with its label and icon component", () => {
        renderSidebar({ links: [{ label: "Home", icon: FaHouse }, { label: "Settings", icon: FaGear }] });
        expect(screen.getByText("Home")).toBeTruthy();
        expect(screen.getByText("Settings")).toBeTruthy();
        expect(document.querySelectorAll("[data-component='Sidebar'] svg, svg").length).toBeGreaterThanOrEqual(2);
    });

    it("renders a router link when the link has a target", () => {
        renderSidebar({ links: [{ label: "Home", to: "/home" }] });
        expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/home");
    });

    it("renders a button that calls onClick when the link has no target", () => {
        const onClick = vi.fn();
        renderSidebar({ links: [{ label: "Logout", onClick }] });
        fireEvent.click(screen.getByRole("button", { name: "Logout" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("closes the panel after a click when the Panel slot provides close", () => {
        const close = vi.fn();
        renderSidebar({ Panel: { isOpen: true, close }, links: [{ label: "Logout" }] });
        fireEvent.click(screen.getByRole("button", { name: "Logout" }));
        expect(close).toHaveBeenCalledTimes(1);
    });

    it("does not put the link description on the DOM element", () => {
        renderSidebar({ links: [{ label: "Home", to: "/home", icon: FaHouse }] });
        const link = screen.getByRole("link", { name: "Home" });
        expect(link.getAttribute("label")).toBeNull();
        expect(link.getAttribute("icon")).toBeNull();
    });

    it("marks the active link", () => {
        renderSidebar({ links: [{ label: "Home", to: "/home", active: true }, { label: "Other", to: "/other" }] });
        expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe("page");
        expect(screen.getByRole("link", { name: "Other" }).getAttribute("aria-current")).toBeNull();
    });
});

describe("Sidebar - link badge", () => {
    it("pins the count to the link icon", () => {
        renderSidebar({ links: [{ label: "Inbox", icon: FaHouse, badge: 6 }] });
        const badge = screen.getByTestId("badge");
        expect(badge.textContent).toBe("6");
        expect(badge.parentElement.querySelector("svg")).not.toBeNull();
    });

    it("shows the badge on a link without icon", () => {
        renderSidebar({ links: [{ label: "Inbox", badge: "2" }] });
        expect(screen.getByTestId("badge").textContent).toBe("2");
    });

    it("hides the badge at 0 and caps a large count", () => {
        renderSidebar({ links: [{ label: "Read", icon: FaHouse, badge: 0 }, { label: "Busy", icon: FaGear, badge: 500 }] });
        const badges = screen.getAllByTestId("badge");
        expect(badges).toHaveLength(1);
        expect(badges[0].textContent).toBe("99+");
    });
});

describe("Sidebar - hideButtonOnScroll", () => {
    const scrollTo = (element, top) => {
        element.scrollTop = top;
        fireEvent.scroll(element);
    };

    const setup = (props = {}) => {
        const scroller = document.createElement("div");
        document.body.appendChild(scroller);
        const utils = renderSidebar({ toggleButton: true, Panel: { isOpen: false }, ...props });
        const toggle = () => document.querySelector("[data-sidebar-toggle]");
        return { ...utils, scroller, toggle };
    };

    it("keeps the button visible on scroll by default", () => {
        const { scroller, toggle } = setup();
        act(() => scrollTo(scroller, 300));
        expect(toggle().getAttribute("data-hidden")).toBeNull();
    });

    it("hides the button on scroll down and brings it back on scroll up", () => {
        const { scroller, toggle } = setup({ hideButtonOnScroll: true });

        act(() => scrollTo(scroller, 300));
        expect(toggle().getAttribute("data-hidden")).toBe("true");
        expect(toggle().getAttribute("aria-hidden")).toBe("true");
        expect(toggle().getAttribute("tabindex")).toBe("-1");

        act(() => scrollTo(scroller, 100));
        expect(toggle().getAttribute("data-hidden")).toBeNull();
        expect(toggle().getAttribute("tabindex")).toBeNull();
    });

    it("ignores a scroll jitter below the threshold", () => {
        const { scroller, toggle } = setup({ hideButtonOnScroll: true });
        act(() => scrollTo(scroller, 4));
        expect(toggle().getAttribute("data-hidden")).toBeNull();
    });

    it("never hides the button while the Sidebar is open", () => {
        const { scroller, toggle } = setup({ hideButtonOnScroll: true, Panel: { isOpen: true } });
        act(() => scrollTo(scroller, 300));
        expect(toggle().getAttribute("data-hidden")).toBeNull();
    });

    it("opens on click when closed and closes when open", () => {
        const open = vi.fn();
        const { toggle, unmount } = setup({ open, Button: { buttonProps: { className: "x" } } });
        fireEvent.click(toggle());
        expect(open).toHaveBeenCalledTimes(1);
        unmount();

        const close = vi.fn();
        const second = setup({ Panel: { isOpen: true, close } });
        fireEvent.click(second.toggle());
        expect(close).toHaveBeenCalledTimes(1);
    });

    it("chains the onClick of the Button slot", () => {
        const open = vi.fn();
        const onClick = vi.fn();
        const { toggle } = setup({ open, Button: { onClick } });
        fireEvent.click(toggle());
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(open).toHaveBeenCalledTimes(1);
    });

    it("toggles without crashing when open and close are absent", () => {
        const { toggle } = setup();
        expect(() => fireEvent.click(toggle())).not.toThrow();
    });
});

describe("Sidebar - toggle button", () => {
    const toggle = () => document.querySelector("[data-sidebar-toggle]");

    it("stays outside the Panel, so a closed Sidebar can still be opened", () => {
        renderSidebar({ toggleButton: true, Panel: { isOpen: false } });
        expect(toggle()).not.toBeNull();
        expect(toggle().closest("[data-component='Panel']")).toBeNull();
    });

    it("is named by its action and exposes the expanded state", () => {
        const { unmount } = renderSidebar({ toggleButton: true, Panel: { isOpen: false } });
        expect(screen.getByRole("button", { name: "Open menu" }).getAttribute("aria-expanded")).toBe("false");
        unmount();

        renderSidebar({ toggleButton: true, Panel: { isOpen: true } });
        expect(screen.getByRole("button", { name: "Close menu" }).getAttribute("aria-expanded")).toBe("true");
    });

    it("takes its names from the labels prop", () => {
        renderSidebar({ toggleButton: true, Panel: { isOpen: false }, labels: { openMenu: "Ouvrir le menu" } });
        expect(screen.getByRole("button", { name: "Ouvrir le menu" })).toBeTruthy();
    });
});
