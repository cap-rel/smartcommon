import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Panel } from "./index";

describe("Panel - dialog semantics", () => {
    it("is a modal dialog named by its title while open", () => {
        render(<Panel id="filters" isOpen title="Filters"><p>body</p></Panel>);
        const dialog = screen.getByRole("dialog", { name: "Filters" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("takes its name from aria-label when there is no title", () => {
        render(<Panel id="actions" isOpen aria-label="Actions"><p>body</p></Panel>);
        expect(screen.getByRole("dialog", { name: "Actions" })).toBeTruthy();
    });

    it("is inert and hidden when closed", () => {
        render(<Panel id="filters" isOpen={false} title="Filters"><button type="button">inside</button></Panel>);
        expect(screen.queryByRole("dialog")).toBeNull();
        const panel = document.querySelector("[data-component='Panel']");
        expect(panel.hasAttribute("inert")).toBe(true);
        expect(panel.getAttribute("aria-hidden")).toBe("true");
    });
});

describe("Panel - focus and Escape", () => {
    const Harness = ({ isOpen, close = () => {}, ...rest }) => (
        <>
            <button type="button">opener</button>
            <Panel id="filters" isOpen={isOpen} close={close} title="Filters" {...rest}>
                <button type="button">first</button>
                <button type="button">last</button>
            </Panel>
        </>
    );

    it("moves the focus inside on open and gives it back on close", () => {
        const { rerender } = render(<Harness isOpen={false} />);
        const opener = screen.getByRole("button", { name: "opener" });
        opener.focus();

        rerender(<Harness isOpen />);
        expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);

        rerender(<Harness isOpen={false} />);
        expect(document.activeElement).toBe(opener);
    });

    it("keeps Shift+Tab inside the dialog", () => {
        render(<Harness isOpen />);
        const first = screen.getByRole("button", { name: "first" });
        first.focus();
        fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "last" }));
    });

    it("closes on Escape unless the overlay is not allowed to close it", () => {
        const close = vi.fn();
        const { rerender } = render(<Harness isOpen close={close} closeOnClickOverlay={false} />);
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(close).not.toHaveBeenCalled();

        rerender(<Harness isOpen close={close} />);
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(close).toHaveBeenCalledTimes(1);
    });
});
