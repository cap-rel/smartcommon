import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Modal } from "./index";
import { fr } from "lib/locales/fr";

describe("Modal - dialog semantics", () => {
    it("is a modal dialog named by its title", () => {
        render(<Modal isOpen onClose={() => {}} title="Edit customer"><p>body</p></Modal>);
        const dialog = screen.getByRole("dialog", { name: "Edit customer" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("takes its name from aria-label when there is no title", () => {
        render(<Modal isOpen onClose={() => {}} showCloseButton={false} aria-label="Photo preview"><p>body</p></Modal>);
        expect(screen.getByRole("dialog", { name: "Photo preview" })).toBeTruthy();
    });

    it("names the close button from labels, English by default", () => {
        const { rerender } = render(<Modal isOpen onClose={() => {}} title="T"><p>body</p></Modal>);
        expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
        rerender(<Modal isOpen onClose={() => {}} title="T" labels={fr.Modal}><p>body</p></Modal>);
        expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy();
    });

    it("uses theme tokens so dark mode applies", () => {
        render(<Modal isOpen onClose={() => {}} title="T"><p>body</p></Modal>);
        const dialog = screen.getByRole("dialog");
        expect(dialog.className).toContain("bg-soft-bg");
        expect(dialog.className).toContain("text-strong-text");
        expect(dialog.className).not.toContain("bg-white");
        expect(dialog.querySelector("h2").className).not.toMatch(/gray-/);
        expect(screen.getByRole("button", { name: "Close" }).className).not.toMatch(/gray-/);
    });
});

describe("Modal - focus", () => {
    const Harness = ({ isOpen, onClose = () => {} }) => (
        <>
            <button type="button">opener</button>
            <Modal isOpen={isOpen} onClose={onClose} title="T">
                <input aria-label="first field" />
                <button type="button">save</button>
            </Modal>
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

    it("keeps Tab and Shift+Tab inside the dialog", () => {
        render(<Harness isOpen />);
        const close = screen.getByRole("button", { name: "Close" });
        const save = screen.getByRole("button", { name: "save" });

        save.focus();
        fireEvent.keyDown(save, { key: "Tab" });
        expect(document.activeElement).toBe(close);

        fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
        expect(document.activeElement).toBe(save);
    });
});

describe("Modal - Escape", () => {
    it("does not close when closeOnEscape is false", () => {
        const onClose = vi.fn();
        render(<Modal isOpen onClose={onClose} closeOnEscape={false} title="T"><p>body</p></Modal>);
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(onClose).not.toHaveBeenCalled();
    });

    it("closes only the topmost of two stacked dialogs", () => {
        const closeBottom = vi.fn();
        const closeTop = vi.fn();
        const { rerender } = render(
            <Modal isOpen onClose={closeBottom} title="Bottom"><p>bottom</p></Modal>
        );
        rerender(
            <>
                <Modal isOpen onClose={closeBottom} title="Bottom"><p>bottom</p></Modal>
                <Modal isOpen onClose={closeTop} title="Top"><p>top</p></Modal>
            </>
        );

        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(closeTop).toHaveBeenCalledTimes(1);
        expect(closeBottom).not.toHaveBeenCalled();
    });

    it("treats a dialog nested in another one as the topmost, even when both open together", () => {
        const closeOuter = vi.fn();
        const closeInner = vi.fn();
        render(
            <Modal isOpen onClose={closeOuter} title="Outer">
                <Modal isOpen onClose={closeInner} title="Inner"><p>inner</p></Modal>
            </Modal>
        );

        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(closeInner).toHaveBeenCalledTimes(1);
        expect(closeOuter).not.toHaveBeenCalled();
    });
});
