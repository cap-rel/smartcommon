/**
 * Select blank first option.
 *
 * The empty <option value=""> lets an optional field be cleared and shows the
 * placeholder while nothing is picked. On a required select that already
 * holds a value it offered a choice the field must refuse.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Select } from "./";

const OPTIONS = [
    { value: "ffessm", label: "FFESSM" },
    { value: "padi", label: "PADI" },
];

const optionValues = () => Array.from(screen.getByLabelText("Organisme").options, option => option.value);

describe("Select - blank option", () => {
    it("is offered on an optional select with a value", () => {
        render(<Select label="Organisme" options={OPTIONS} value="padi" onChange={() => {}} />);
        expect(optionValues()).toEqual(["", "ffessm", "padi"]);
    });

    it("is offered on a required select without a value, with the placeholder", () => {
        render(<Select label="Organisme" placeholder="Choisir" required options={OPTIONS} value="" onChange={() => {}} />);
        const select = screen.getByLabelText("Organisme");
        expect(optionValues()).toEqual(["", "ffessm", "padi"]);
        expect(select.options[0].textContent).toBe("Choisir");
    });

    it("is not offered on a required select that holds a value", () => {
        render(<Select label="Organisme" required options={OPTIONS} value="padi" onChange={() => {}} />);
        expect(optionValues()).toEqual(["ffessm", "padi"]);
        expect(screen.getByLabelText("Organisme").value).toBe("padi");
    });

    it("comes back when a required select is emptied", () => {
        const { rerender } = render(<Select label="Organisme" required options={OPTIONS} value="padi" onChange={() => {}} />);
        rerender(<Select label="Organisme" required options={OPTIONS} value="" onChange={() => {}} />);
        expect(optionValues()).toEqual(["", "ffessm", "padi"]);
    });

    it("is not offered on a required uncontrolled select once a default value is set", () => {
        render(<Select label="Organisme" required options={OPTIONS} defaultValue="ffessm" />);
        expect(optionValues()).toEqual(["ffessm", "padi"]);
    });
});
