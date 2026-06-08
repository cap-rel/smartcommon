/**
 * Input accessibility (todo item 9).
 *
 * - A visible label is associated to the <input> via htmlFor/id.
 * - Without a visible label, the placeholder becomes the accessible name.
 * - Icon-only buttons (password toggle, steppers) expose an aria-label.
 * - A consumer-provided aria-label still wins over the defaults.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Input } from "./";

describe("Input - accessibility", () => {
    it("associates a visible label to the input", () => {
        render(<Input label="Email" name="email" value="" onChange={() => {}} />);
        // getByLabelText resolves through the htmlFor/id association.
        expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
    });

    it("falls back to the placeholder as accessible name when there is no label", () => {
        render(<Input placeholder="Rechercher" value="" onChange={() => {}} />);
        expect(screen.getByLabelText("Rechercher").tagName).toBe("INPUT");
    });

    it("does not set a redundant aria-label when a visible label is present", () => {
        render(<Input label="Nom" placeholder="Votre nom" value="" onChange={() => {}} />);
        expect(screen.getByLabelText("Nom").getAttribute("aria-label")).toBeNull();
    });

    it("labels the password visibility toggle", () => {
        render(<Input type="password" value="secret" onChange={() => {}} />);
        expect(screen.getByRole("button", { name: "Afficher le mot de passe" })).toBeTruthy();
    });

    it("labels the stepper buttons", () => {
        render(<Input step={1} value={0} onChange={() => {}} />);
        expect(screen.getByRole("button", { name: "Diminuer" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Augmenter" })).toBeTruthy();
    });

    it("lets the consumer override a button aria-label", () => {
        render(
            <Input
                step={1}
                value={0}
                onChange={() => {}}
                MinusButton={{ buttonProps: { "aria-label": "Moins" } }}
            />
        );
        expect(screen.getByRole("button", { name: "Moins" })).toBeTruthy();
    });
});
