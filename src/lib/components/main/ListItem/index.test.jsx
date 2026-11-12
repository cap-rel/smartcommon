import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FaChevronRight } from "react-icons/fa6";

import { ListItem } from "./";

const trailingIcons = (container) => container.querySelectorAll("svg");

describe("ListItem - trailing icon", () => {
    it("shows no trailing icon unless asked", () => {
        const { container } = render(<ListItem title="Invoice 42" />);
        expect(trailingIcons(container)).toHaveLength(0);
    });

    it("keeps the pencil for a link item", () => {
        const { container } = render(<ListItem title="Invoice 42" link />);
        const icons = trailingIcons(container);
        expect(icons).toHaveLength(1);
        expect(icons[0].getAttribute("aria-hidden")).toBe("true");
        expect(icons[0].getAttribute("class")).toContain("text-primary");
    });

    it("renders the icon given by trailingIcon, or none with false", () => {
        const { container, rerender } = render(<ListItem title="Invoice 42" trailingIcon={FaChevronRight} />);
        expect(trailingIcons(container)).toHaveLength(1);
        rerender(<ListItem title="Invoice 42" link trailingIcon={false} />);
        expect(trailingIcons(container)).toHaveLength(0);
    });
});

describe("ListItem - interactions", () => {
    it("is a plain block without onClick nor href", () => {
        render(<ListItem title="Invoice 42" data-testid="item" />);
        const item = screen.getByTestId("item");
        expect(item.tagName).toBe("DIV");
        expect(item.getAttribute("role")).toBeNull();
        expect(item.getAttribute("tabindex")).toBeNull();
    });

    it("acts as a keyboard reachable button with onClick", () => {
        const onClick = vi.fn();
        render(<ListItem title="Invoice 42" onClick={onClick} />);
        const item = screen.getByRole("button", { name: /Invoice 42/ });
        expect(item.getAttribute("tabindex")).toBe("0");

        fireEvent.click(item);
        fireEvent.keyDown(item, { key: "Enter" });
        fireEvent.keyDown(item, { key: " " });
        fireEvent.keyUp(item, { key: " " });
        expect(onClick).toHaveBeenCalledTimes(3);
    });

    it("ignores keys pressed on an inner control", () => {
        const onClick = vi.fn();
        render(<ListItem title="Invoice 42" onClick={onClick} status={<button type="button">tag</button>} />);
        fireEvent.keyDown(screen.getByRole("button", { name: "tag" }), { key: "Enter" });
        expect(onClick).not.toHaveBeenCalled();
    });

    it("renders a real link with href", () => {
        render(<ListItem title="Invoice 42" href="/invoices/42" />);
        const link = screen.getByRole("link", { name: /Invoice 42/ });
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe("/invoices/42");
    });

    it("forwards data-* and aria-* attributes to the root", () => {
        render(<ListItem title="Invoice 42" onClick={() => {}} data-testid="row-42" aria-label="Open invoice 42" />);
        const item = screen.getByTestId("row-42");
        expect(item.getAttribute("role")).toBe("button");
        expect(screen.getByRole("button", { name: "Open invoice 42" })).toBe(item);
    });
});
