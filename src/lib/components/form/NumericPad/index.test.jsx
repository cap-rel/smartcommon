import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { NumericPad } from "./";

const findKey = (label) => screen.getByLabelText(label);

describe("NumericPad - basic input", () => {
    it("calls onChange with the typed digit when current value is the placeholder zero", () => {
        const onChange = vi.fn();
        render(<NumericPad value="0" onChange={onChange} />);

        fireEvent.click(findKey("Digit 5"));
        expect(onChange).toHaveBeenCalledWith("5");
    });

    it("appends digits when current value is non-zero", () => {
        const onChange = vi.fn();
        render(<NumericPad value="12" onChange={onChange} />);

        fireEvent.click(findKey("Digit 3"));
        expect(onChange).toHaveBeenCalledWith("123");
    });

    it("renders the placeholder 0 in the display when value is empty", () => {
        const { container } = render(<NumericPad value="" onChange={() => {}} />);
        // Display is the element with aria-live="polite"
        const display = container.querySelector('[aria-live="polite"]');
        expect(display).not.toBeNull();
        expect(display.textContent).toBe("0");
    });
});

describe("NumericPad - decimal mode", () => {
    it("allows a single comma in decimal mode", () => {
        const onChange = vi.fn();
        render(<NumericPad value="5" onChange={onChange} mode="decimal" />);

        fireEvent.click(findKey("Decimal separator"));
        expect(onChange).toHaveBeenCalledWith("5,");
    });

    it("blocks a second comma", () => {
        const onChange = vi.fn();
        render(<NumericPad value="5,2" onChange={onChange} mode="decimal" />);

        fireEvent.click(findKey("Decimal separator"));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("limits decimal places to 2", () => {
        const onChange = vi.fn();
        render(<NumericPad value="5,12" onChange={onChange} mode="decimal" />);

        fireEvent.click(findKey("Digit 3"));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("does not render the comma key in integer mode", () => {
        render(<NumericPad value="0" onChange={() => {}} mode="integer" />);
        expect(screen.queryByLabelText("Decimal separator")).toBeNull();
    });
});

describe("NumericPad - backspace", () => {
    it("removes the last character", () => {
        const onChange = vi.fn();
        render(<NumericPad value="12" onChange={onChange} />);

        fireEvent.click(findKey("Backspace"));
        expect(onChange).toHaveBeenCalledWith("1");
    });

    it("falls back to '0' when emptying the value", () => {
        const onChange = vi.fn();
        render(<NumericPad value="5" onChange={onChange} />);

        fireEvent.click(findKey("Backspace"));
        expect(onChange).toHaveBeenCalledWith("0");
    });
});

describe("NumericPad - confirm button", () => {
    it("is rendered when onConfirm is provided and triggers it with the current value", () => {
        const onConfirm = vi.fn();
        render(
            <NumericPad value="42" onChange={() => {}} onConfirm={onConfirm} />
        );

        fireEvent.click(screen.getByLabelText("Confirm"));
        expect(onConfirm).toHaveBeenCalledWith("42");
    });

    it("is hidden when onConfirm is not provided", () => {
        render(<NumericPad value="42" onChange={() => {}} />);
        expect(screen.queryByLabelText("Confirm")).toBeNull();
    });
});

describe("NumericPad - labels override", () => {
    it("uses provided labels on aria-label", () => {
        render(
            <NumericPad
                value="0"
                onChange={() => {}}
                onConfirm={() => {}}
                labels={{
                    confirm: "Valider",
                    backspace: "Effacer",
                    digit: (k) => `Chiffre ${k}`,
                }}
            />
        );

        expect(screen.getByLabelText("Valider")).toBeTruthy();
        expect(screen.getByLabelText("Effacer")).toBeTruthy();
        expect(screen.getByLabelText("Chiffre 7")).toBeTruthy();
    });
});

describe("NumericPad - custom icons", () => {
    it("renders the supplied backspace and confirm icons", () => {
        render(
            <NumericPad
                value="1"
                onChange={() => {}}
                onConfirm={() => {}}
                backspaceIcon={<span data-testid="custom-back">BACK</span>}
                confirmIcon={<span data-testid="custom-ok">OK</span>}
            />
        );

        expect(screen.getByTestId("custom-back")).toBeTruthy();
        expect(screen.getByTestId("custom-ok")).toBeTruthy();
    });
});
