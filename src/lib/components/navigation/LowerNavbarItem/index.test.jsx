import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FaInbox } from "react-icons/fa6";

import { LowerNavbarItem } from "./";

describe("LowerNavbarItem - accessibility", () => {
    it("is a focusable link named by its label", () => {
        render(<LowerNavbarItem id="inbox" label="Inbox" icon={<FaInbox />} />);
        const item = screen.getByRole("link", { name: "Inbox" });
        expect(item.getAttribute("tabindex")).toBe("0");
    });

    it("marks the active item as the current page", () => {
        render(<LowerNavbarItem id="inbox" label="Inbox" active />);
        expect(screen.getByRole("link", { name: "Inbox" }).getAttribute("aria-current")).toBe("page");
    });

    it("leaves aria-current off an inactive item", () => {
        render(<LowerNavbarItem id="inbox" label="Inbox" />);
        expect(screen.getByRole("link", { name: "Inbox" }).hasAttribute("aria-current")).toBe(false);
    });

    it("activates with Enter", () => {
        const onClick = vi.fn();
        render(<LowerNavbarItem id="inbox" label="Inbox" onClick={onClick} />);
        fireEvent.keyDown(screen.getByRole("link", { name: "Inbox" }), { key: "Enter" });
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("ignores other keys", () => {
        const onClick = vi.fn();
        render(<LowerNavbarItem id="inbox" label="Inbox" onClick={onClick} />);
        fireEvent.keyDown(screen.getByRole("link", { name: "Inbox" }), { key: "a" });
        expect(onClick).not.toHaveBeenCalled();
    });

    it("blocks click and keyboard when disabled, and leaves the tab order", () => {
        const onClick = vi.fn();
        render(<LowerNavbarItem id="inbox" label="Inbox" disabled onClick={onClick} />);
        const item = screen.getByRole("link", { name: "Inbox" });

        fireEvent.click(item);
        fireEvent.keyDown(item, { key: "Enter" });

        expect(onClick).not.toHaveBeenCalled();
        expect(item.getAttribute("aria-disabled")).toBe("true");
        expect(item.getAttribute("tabindex")).toBe("-1");
    });

    it("still calls a consumer onKeyDown passed through containerProps", () => {
        const onKeyDown = vi.fn();
        render(<LowerNavbarItem id="inbox" label="Inbox" containerProps={{ onKeyDown }} />);
        fireEvent.keyDown(screen.getByRole("link", { name: "Inbox" }), { key: "Enter" });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it("keeps a containerProps onClick in charge, for the mouse and for Enter", () => {
        const onClick = vi.fn();
        const containerOnClick = vi.fn();
        render(<LowerNavbarItem id="inbox" label="Inbox" onClick={onClick} containerProps={{ onClick: containerOnClick }} />);
        const item = screen.getByRole("link", { name: "Inbox" });

        fireEvent.click(item);
        fireEvent.keyDown(item, { key: "Enter" });

        expect(containerOnClick).toHaveBeenCalledTimes(2);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("takes an aria-label and data-* for an icon-only item", () => {
        render(<LowerNavbarItem id="inbox" icon={<FaInbox />} aria-label="Inbox" data-testid="inbox-tab" />);
        const item = screen.getByRole("link", { name: "Inbox" });
        expect(item.getAttribute("data-testid")).toBe("inbox-tab");
    });
});
