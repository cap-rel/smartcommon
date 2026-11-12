import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Popup } from "./index";
import { fr } from "lib/locales/fr";

describe("Popup - dialog semantics", () => {
    it("is a modal dialog named by its title while open", () => {
        render(<Popup isOpen title="Pick a date"><p>body</p></Popup>);
        const dialog = screen.getByRole("dialog", { name: "Pick a date" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
    });

    it("takes its name from aria-label when there is no title", () => {
        render(<Popup isOpen aria-label="Signature"><p>body</p></Popup>);
        expect(screen.getByRole("dialog", { name: "Signature" })).toBeTruthy();
    });

    it("is inert and hidden when closed but kept mounted", () => {
        render(<Popup isOpen={false} title="Pick a date"><button type="button">inside</button></Popup>);
        expect(screen.queryByRole("dialog")).toBeNull();
        const popup = document.querySelector("[data-component='Popup']");
        expect(popup.hasAttribute("inert")).toBe(true);
        expect(popup.getAttribute("aria-hidden")).toBe("true");
    });

    it("names the close button from labels, English by default", () => {
        const { rerender } = render(<Popup isOpen closeButton title="T"><p>body</p></Popup>);
        expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
        rerender(<Popup isOpen closeButton title="T" labels={fr.Popup}><p>body</p></Popup>);
        expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy();
    });
});

describe("Popup - focus and Escape", () => {
    const Harness = ({ isOpen, close = () => {}, ...rest }) => (
        <>
            <button type="button">opener</button>
            <Popup isOpen={isOpen} close={close} title="T" {...rest}>
                <button type="button">first</button>
                <button type="button">last</button>
            </Popup>
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

    it("keeps Tab inside the dialog", () => {
        render(<Harness isOpen />);
        const last = screen.getByRole("button", { name: "last" });
        last.focus();
        fireEvent.keyDown(last, { key: "Tab" });
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "first" }));
    });

    it("closes on Escape", () => {
        const close = vi.fn();
        render(<Harness isOpen close={close} />);
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(close).toHaveBeenCalledTimes(1);
    });

    it("stays open on Escape when the overlay does not close it either", () => {
        const close = vi.fn();
        render(<Harness isOpen close={close} closeOnClickOverlay={false} />);
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(close).not.toHaveBeenCalled();
    });

    it("does not react to Escape while closed", () => {
        const close = vi.fn();
        render(<Harness isOpen={false} close={close} />);
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(close).not.toHaveBeenCalled();
    });
});
