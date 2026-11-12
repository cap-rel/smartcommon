import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FaInbox } from "react-icons/fa6";

import { TabbarItem } from "./";

describe("TabbarItem - badge", () => {
    it("pins the badge to the icon", () => {
        render(<TabbarItem id="inbox" label="Inbox" icon={FaInbox} badge={2} />);
        const badge = screen.getByTestId("badge");
        expect(badge.textContent).toBe("2");
        expect(badge.parentElement.querySelector("svg")).not.toBeNull();
    });

    it("still shows the badge on a tab without icon", () => {
        render(<TabbarItem id="inbox" label="Inbox" badge={5} />);
        expect(screen.getByTestId("badge").textContent).toBe("5");
    });

    it.each([[0], [undefined], [""]])("renders no badge for %p", (badge) => {
        render(<TabbarItem id="inbox" label="Inbox" icon={FaInbox} badge={badge} />);
        expect(screen.queryByTestId("badge")).toBeNull();
    });

    it("caps a large count", () => {
        render(<TabbarItem id="inbox" label="Inbox" icon={FaInbox} badge={1000} />);
        expect(screen.getByTestId("badge").textContent).toBe("99+");
    });
});

describe("TabbarItem - accessibility", () => {
    it("is a focusable link named by its label", () => {
        render(<TabbarItem id="inbox" label="Inbox" icon={FaInbox} />);
        const tab = screen.getByRole("link", { name: "Inbox" });
        expect(tab.getAttribute("tabindex")).toBe("0");
    });

    it("marks the active tab as the current page", () => {
        render(<TabbarItem id="inbox" label="Inbox" active />);
        expect(screen.getByRole("link", { name: "Inbox" }).getAttribute("aria-current")).toBe("page");
    });

    it("leaves aria-current off an inactive tab", () => {
        render(<TabbarItem id="inbox" label="Inbox" />);
        expect(screen.getByRole("link", { name: "Inbox" }).hasAttribute("aria-current")).toBe(false);
    });

    it("activates with Enter", () => {
        const onClick = vi.fn();
        render(<TabbarItem id="inbox" label="Inbox" onClick={onClick} />);
        fireEvent.keyDown(screen.getByRole("link", { name: "Inbox" }), { key: "Enter" });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("ignores other keys", () => {
        const onClick = vi.fn();
        render(<TabbarItem id="inbox" label="Inbox" onClick={onClick} />);
        fireEvent.keyDown(screen.getByRole("link", { name: "Inbox" }), { key: "a" });
        expect(onClick).not.toHaveBeenCalled();
    });

    it("blocks click and keyboard when disabled, and leaves the tab order", () => {
        const onClick = vi.fn();
        render(<TabbarItem id="inbox" label="Inbox" disabled onClick={onClick} />);
        const tab = screen.getByRole("link", { name: "Inbox" });

        fireEvent.click(tab);
        fireEvent.keyDown(tab, { key: "Enter" });

        expect(onClick).not.toHaveBeenCalled();
        expect(tab.getAttribute("aria-disabled")).toBe("true");
        expect(tab.getAttribute("tabindex")).toBe("-1");
    });

    it("still calls a consumer onKeyDown passed through containerProps", () => {
        const onKeyDown = vi.fn();
        render(<TabbarItem id="inbox" label="Inbox" containerProps={{ onKeyDown }} />);
        fireEvent.keyDown(screen.getByRole("link", { name: "Inbox" }), { key: "Enter" });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it("takes an aria-label for an icon-only tab", () => {
        render(<TabbarItem id="inbox" icon={FaInbox} aria-label="Inbox" />);
        expect(screen.getByRole("link", { name: "Inbox" })).toBeTruthy();
    });
});
