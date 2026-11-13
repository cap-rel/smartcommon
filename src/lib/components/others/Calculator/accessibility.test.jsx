/**
 * Calculator accessibility, labels and theme.
 *
 * The panel stayed in the page once closed (only faded out), so Tab still
 * reached its twenty buttons; its texts were fixed English strings and the
 * symbol keys had no spoken name.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Calculator } from "./index";
import { fr } from "lib/locales/fr";

describe("Calculator - accessibility", () => {
    it("opens from a FAB named by the labels", () => {
        render(<Calculator labels={fr.Calculator} />);
        fireEvent.click(screen.getByRole("button", { name: "Ouvrir la calculatrice" }));
        expect(screen.getByRole("dialog", { name: "Calculatrice" })).toBeTruthy();
    });

    it("keeps the closed panel out of reach of Tab and screen readers", () => {
        const { container } = render(<Calculator isOpen={false} showFab={false} />);
        const panel = container.querySelector('[data-component="Calculator"]');
        expect(panel.hasAttribute("inert")).toBe(true);
        expect(panel.getAttribute("aria-hidden")).toBe("true");
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("names the symbol keys and the close button", () => {
        render(<Calculator isOpen onOpenChange={() => {}} labels={fr.Calculator} />);
        const dialog = screen.getByRole("dialog", { name: "Calculatrice" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
        for (const name of ["Diviser", "Multiplier", "Soustraire", "Additionner", "Égal", "Changer de signe", "Fermer", "Effacer"]) {
            expect(screen.getByRole("button", { name }), name).toBeTruthy();
        }
    });

    it("closes once on Escape", () => {
        const onClose = vi.fn();
        const onOpenChange = vi.fn();
        render(<Calculator isOpen onOpenChange={onOpenChange} onClose={onClose} />);

        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("still computes from the keyboard", () => {
        const onResult = vi.fn();
        render(<Calculator isOpen onOpenChange={() => {}} onResult={onResult} />);

        for (const key of ["1", "2", "+", "3", "Enter"]) {
            fireEvent.keyDown(window, { key });
        }
        expect(onResult).toHaveBeenCalledWith(15);
    });

    it("lets the title prop override the label", () => {
        render(<Calculator isOpen onOpenChange={() => {}} title="Métrés" labels={fr.Calculator} />);
        expect(screen.getByRole("dialog", { name: "Métrés" })).toBeTruthy();
    });

    it("only uses colour tokens the theme defines", () => {
        render(<Calculator isOpen onOpenChange={() => {}} />);
        expect(screen.getByRole("dialog").outerHTML).not.toMatch(/soft-bg-alt|soft-text-muted|primary-text/);
    });
});
