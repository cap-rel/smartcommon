import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { PinPad } from "./";

describe("PinPad - entry", () => {
    it("appends a typed digit to the value", () => {
        const onChange = vi.fn();
        render(<PinPad value="12" onChange={onChange} />);

        fireEvent.click(screen.getByText("5"));
        expect(onChange).toHaveBeenCalledWith("125");
    });

    it("does not append past maxLength", () => {
        const onChange = vi.fn();
        render(<PinPad value="12345678" onChange={onChange} maxLength={8} />);

        fireEvent.click(screen.getByText("9"));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("removes the last digit on backspace", () => {
        const onChange = vi.fn();
        render(<PinPad value="123" onChange={onChange} />);

        fireEvent.click(screen.getByLabelText("Backspace"));
        expect(onChange).toHaveBeenCalledWith("12");
    });

    it("ignores backspace on an empty value", () => {
        const onChange = vi.fn();
        render(<PinPad value="" onChange={onChange} />);

        fireEvent.click(screen.getByLabelText("Backspace"));
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe("PinPad - masking", () => {
    it("renders one dot per position, padded to minLength", () => {
        const { container } = render(
            <PinPad value="12" onChange={() => {}} minLength={4} />
        );
        const dots = container.querySelectorAll(
            '[data-component="PinPad"] > div:first-child > span'
        );
        expect(dots.length).toBe(4);
    });
});

describe("PinPad - validate", () => {
    it("disables validate until minLength is reached", () => {
        const onSubmit = vi.fn();
        render(
            <PinPad value="123" onChange={() => {}} onSubmit={onSubmit} minLength={4} />
        );

        const validate = screen.getByLabelText("Validate");
        expect(validate.disabled).toBe(true);
        fireEvent.click(validate);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("calls onSubmit when validate is pressed at minLength", () => {
        const onSubmit = vi.fn();
        render(
            <PinPad value="1234" onChange={() => {}} onSubmit={onSubmit} minLength={4} />
        );

        fireEvent.click(screen.getByLabelText("Validate"));
        expect(onSubmit).toHaveBeenCalled();
    });
});

describe("PinPad - disabled", () => {
    it("ignores digit presses when disabled", () => {
        const onChange = vi.fn();
        render(<PinPad value="1" onChange={onChange} disabled />);

        fireEvent.click(screen.getByText("5"));
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe("PinPad - keyboard (global)", () => {
    it("appends a digit typed on the physical keyboard", () => {
        const onChange = vi.fn();
        render(<PinPad value="12" onChange={onChange} />);

        fireEvent.keyDown(document, { key: "5" });
        expect(onChange).toHaveBeenCalledWith("125");
    });

    it("removes the last digit on Backspace", () => {
        const onChange = vi.fn();
        render(<PinPad value="123" onChange={onChange} />);

        fireEvent.keyDown(document, { key: "Backspace" });
        expect(onChange).toHaveBeenCalledWith("12");
    });

    it("submits on Enter once minLength is reached", () => {
        const onSubmit = vi.fn();
        render(
            <PinPad value="1234" onChange={() => {}} onSubmit={onSubmit} minLength={4} />
        );

        fireEvent.keyDown(document, { key: "Enter" });
        expect(onSubmit).toHaveBeenCalled();
    });

    it("ignores Enter below minLength", () => {
        const onSubmit = vi.fn();
        render(
            <PinPad value="12" onChange={() => {}} onSubmit={onSubmit} minLength={4} />
        );

        fireEvent.keyDown(document, { key: "Enter" });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does not steal keystrokes typed inside an input", () => {
        const onChange = vi.fn();
        render(
            <div>
                <input data-testid="field" />
                <PinPad value="12" onChange={onChange} />
            </div>
        );

        fireEvent.keyDown(screen.getByTestId("field"), { key: "5" });
        expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores the keyboard when disabled", () => {
        const onChange = vi.fn();
        render(<PinPad value="12" onChange={onChange} disabled />);

        fireEvent.keyDown(document, { key: "5" });
        expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores the keyboard when keyboard={false}", () => {
        const onChange = vi.fn();
        render(<PinPad value="12" onChange={onChange} keyboard={false} />);

        fireEvent.keyDown(document, { key: "5" });
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe("PinPad - keyboard (local)", () => {
    it("reacts to keys on the focused container", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PinPad value="12" onChange={onChange} keyboard="local" />
        );

        const pad = container.querySelector('[data-component="PinPad"]');
        fireEvent.keyDown(pad, { key: "5" });
        expect(onChange).toHaveBeenCalledWith("125");
    });

    it("does not listen on document in local mode", () => {
        const onChange = vi.fn();
        render(<PinPad value="12" onChange={onChange} keyboard="local" />);

        fireEvent.keyDown(document, { key: "5" });
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe("PinPad - labels override", () => {
    it("applies custom aria labels to the icon keys", () => {
        render(
            <PinPad
                value="1234"
                onChange={() => {}}
                onSubmit={() => {}}
                labels={{ backspace: "Effacer", validate: "Valider" }}
            />
        );

        expect(screen.getByLabelText("Effacer")).toBeTruthy();
        expect(screen.getByLabelText("Valider")).toBeTruthy();
    });
});
