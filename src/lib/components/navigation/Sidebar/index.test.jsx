import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
