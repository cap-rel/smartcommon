/**
 * Input accessibility (todo item 9).
 *
 * - A visible label is associated to the <input> via htmlFor/id.
 * - Without a visible label, the placeholder becomes the accessible name.
 * - Icon-only buttons (password toggle, steppers) expose an aria-label.
 * - A consumer-provided aria-label still wins over the defaults.
 */

import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { Input } from "./";
import { fr } from "lib/locales/fr";

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

    it("labels the password visibility toggle in English by default", () => {
        render(<Input type="password" value="secret" onChange={() => {}} />);
        fireEvent.click(screen.getByRole("button", { name: "Show password" }));
        expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();
    });

    it("labels the stepper buttons in English by default", () => {
        render(<Input step={1} value={0} onChange={() => {}} />);
        expect(screen.getByRole("button", { name: "Decrease" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Increase" })).toBeTruthy();
    });

    it("translates the button labels through the locale bundle", () => {
        render(
            <>
                <Input type="password" value="secret" onChange={() => {}} labels={fr.Input} />
                <Input step={1} value={0} onChange={() => {}} labels={fr.Input} />
            </>
        );
        expect(screen.getByRole("button", { name: "Afficher le mot de passe" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Diminuer" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Augmenter" })).toBeTruthy();
    });

    it("is neither invalid nor described while no error shows", () => {
        render(<Input label="Email" required value="" onChange={() => {}} />);
        const input = screen.getByLabelText("Email");
        expect(input.getAttribute("aria-invalid")).toBeNull();
        expect(input.getAttribute("aria-describedby")).toBeNull();
    });

    it("links the shown rule errors to the input and flags it invalid", () => {
        render(<Input label="Code" required minLength={3} value="" formSubmitted onChange={() => {}} />);
        const input = screen.getByLabelText("Code");
        expect(input.getAttribute("aria-invalid")).toBe("true");
        const ids = input.getAttribute("aria-describedby").split(" ");
        expect(ids).toHaveLength(1);
        expect(document.getElementById(ids[0]).textContent).toBe("This field is required.");
    });

    it("links a consumer error message to the input", () => {
        render(<Input id="email" label="Email" value="x" error="Unknown address" onChange={() => {}} />);
        const input = screen.getByLabelText("Email");
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toBe("email-error");
        expect(document.getElementById("email-error").textContent).toBe("Unknown address");
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

    it("keeps a consumer aria-describedby in front of the error ids", () => {
        render(<Input id="name" label="Name" aria-describedby="name-help" value="x" error="Taken" onChange={() => {}} />);
        expect(screen.getByLabelText("Name").getAttribute("aria-describedby")).toBe("name-help name-error");
    });
});
