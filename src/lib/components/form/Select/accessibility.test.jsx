/**
 * Select accessibility.
 *
 * Same contract as Input, which Select did not honour: its visible label was
 * rendered next to the control without ever being tied to it, so the <select>
 * had no accessible name at all. A screen reader announced a bare "combobox",
 * and getByLabelText() found nothing.
 *
 * - A visible label is associated to the <select> via htmlFor/id.
 * - Without a visible label, the placeholder becomes the accessible name.
 * - A consumer-provided id or aria-label still wins.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Select } from "./";

const OPTIONS = [
    { value: "ffessm", label: "FFESSM" },
    { value: "padi", label: "PADI" },
];

describe("Select - accessibility", () => {
    it("associates a visible label to the select", () => {
        render(<Select label="Organisme" name="org" options={OPTIONS} value="" onChange={() => {}} />);
        // getByLabelText resolves through the htmlFor/id association.
        expect(screen.getByLabelText("Organisme").tagName).toBe("SELECT");
    });

    it("falls back to the placeholder as accessible name when there is no label", () => {
        render(<Select placeholder="Sélectionner un organisme" options={OPTIONS} value="" onChange={() => {}} />);
        expect(screen.getByLabelText("Sélectionner un organisme").tagName).toBe("SELECT");
    });

    it("does not set a redundant aria-label when a visible label is present", () => {
        render(
            <Select
                label="Organisme"
                placeholder="Sélectionner un organisme"
                options={OPTIONS}
                value=""
                onChange={() => {}}
            />
        );
        expect(screen.getByLabelText("Organisme").getAttribute("aria-label")).toBeNull();
    });

    it("honours an id provided by the consumer", () => {
        render(<Select id="org-field" label="Organisme" options={OPTIONS} value="" onChange={() => {}} />);
        expect(screen.getByLabelText("Organisme").getAttribute("id")).toBe("org-field");
    });

    it("gives two selects of the same page distinct ids", () => {
        render(
            <>
                <Select label="Organisme" options={OPTIONS} value="" onChange={() => {}} />
                <Select label="Niveau" options={OPTIONS} value="" onChange={() => {}} />
            </>
        );
        const first = screen.getByLabelText("Organisme").getAttribute("id");
        const second = screen.getByLabelText("Niveau").getAttribute("id");
        expect(first).toBeTruthy();
        expect(first).not.toBe(second);
    });

    it("is neither invalid nor described while no error shows", () => {
        render(<Select label="Organisme" required options={OPTIONS} value="" onChange={() => {}} />);
        const select = screen.getByLabelText("Organisme");
        expect(select.getAttribute("aria-invalid")).toBeNull();
        expect(select.getAttribute("aria-describedby")).toBeNull();
    });

    it("links the shown errors to the select and flags it invalid", () => {
        render(
            <Select
                id="org"
                label="Organisme"
                required
                options={OPTIONS}
                value=""
                formSubmitted
                error="Pick your federation"
                onChange={() => {}}
            />
        );
        const select = screen.getByLabelText("Organisme");
        expect(select.getAttribute("aria-invalid")).toBe("true");
        expect(select.getAttribute("aria-describedby")).toBe("org-error org-error-0");
        expect(document.getElementById("org-error").textContent).toBe("Pick your federation");
        expect(document.getElementById("org-error-0").textContent).toBe("At least one item must be selected.");
    });

    it("keeps working on a disabled select", () => {
        render(<Select label="Organisme" options={OPTIONS} value="" onChange={() => {}} disabled />);
        const select = screen.getByLabelText("Organisme");
        expect(select.tagName).toBe("SELECT");
        expect(select.disabled).toBe(true);
    });
});
