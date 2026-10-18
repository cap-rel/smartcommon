/**
 * Validation rules of the form fields, observed through the `onError`
 * channel of useField: each rule reports (ruleKey, conditionBoolean), where
 * `true` means the rule fails.
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { Input } from "lib/components/form/Input";
import { Select } from "lib/components/form/Select";
import { Range } from "lib/components/form/Range";
import { Rater } from "lib/components/form/Rater";
import { Textarea } from "lib/components/form/Textarea";

const reportedRules = (element) => {
    const onError = vi.fn();
    render({ ...element, props: { ...element.props, onError, onChange: vi.fn() } });
    return Object.fromEntries(onError.mock.calls);
};

describe("Input rules", () => {
    it("accepts a valid number", () => {
        expect(reportedRules(<Input type="number" required value={42} />)).toMatchObject({ number: false, required: false });
    });

    it("accepts zero as a filled required number", () => {
        expect(reportedRules(<Input type="number" required value={0} />)).toMatchObject({ required: false });
    });

    it("flags a non numeric value", () => {
        expect(reportedRules(<Input type="number" value="abc" />)).toMatchObject({ number: true });
    });

    it("accepts a filled required date (timestamp)", () => {
        expect(reportedRules(<Input type="date" required value={1700000000000} />)).toMatchObject({ required: false });
    });

    it("flags an empty required text", () => {
        expect(reportedRules(<Input required value="" />)).toMatchObject({ required: true });
    });
});

describe("Select rules", () => {
    const options = [{ value: 1, label: "One" }, { value: 2, label: "Two" }];

    it("accepts a value among object options, numeric or stringified", () => {
        expect(reportedRules(<Select options={options} required value={1} />)).toMatchObject({ required: false, notAnOption: false });
        expect(reportedRules(<Select options={options} value="2" />)).toMatchObject({ notAnOption: false });
    });

    it("accepts a value among plain options", () => {
        expect(reportedRules(<Select options={["a", "b"]} value="b" />)).toMatchObject({ notAnOption: false });
    });

    it("flags a value outside the options", () => {
        expect(reportedRules(<Select options={options} value={3} />)).toMatchObject({ notAnOption: true });
    });

    it("checks every value in multiple mode", () => {
        expect(reportedRules(<Select multiple options={options} value={["1", "2"]} />)).toMatchObject({ notAnOption: false });
        expect(reportedRules(<Select multiple options={options} value={["1", "9"]} />)).toMatchObject({ notAnOption: true });
    });
});

describe("Range and Rater rules", () => {
    it("accepts a filled required Range, zero included", () => {
        expect(reportedRules(<Range required value={0} />)).toMatchObject({ required: false });
        expect(reportedRules(<Range required value={50} />)).toMatchObject({ required: false });
    });

    it("accepts a rating, treats 0 stars as not rated", () => {
        expect(reportedRules(<Rater required value={3} />)).toMatchObject({ required: false });
        expect(reportedRules(<Rater required value={0} />)).toMatchObject({ required: true });
    });
});

describe("Textarea rules", () => {
    it("flags an empty required text and accepts a filled one", () => {
        expect(reportedRules(<Textarea required value="" />)).toMatchObject({ required: true });
        expect(reportedRules(<Textarea required value="ok" />)).toMatchObject({ required: false });
    });
});

describe("cleared parsed inputs", () => {
    it.each(["number", "date", "time"])("a cleared %s field emits null and fails required", (type) => {
        const onChange = vi.fn();
        const onError = vi.fn();
        const initial = type === "number" ? 5 : type === "date" ? 1700000000000 : 90;

        const { rerender } = render(<Input label="Field" type={type} required value={initial} onChange={onChange} onError={onError} />);
        fireEvent.change(screen.getByLabelText("Field"), { target: { value: "" } });

        expect(onChange).toHaveBeenCalledWith(null, expect.anything());
        expect(onChange).toHaveBeenCalledTimes(1);

        onError.mockClear();
        rerender(<Input label="Field" type={type} required value={null} onChange={onChange} onError={onError} />);
        expect(onError).toHaveBeenCalledWith("required", true);
    });
});

describe("Input bounds, length and pattern rules", () => {
    it("checks number bounds, negative values included", () => {
        expect(reportedRules(<Input type="number" value={-5} />)).toMatchObject({ min: false, max: false });
        expect(reportedRules(<Input type="number" min={1} max={10} value={0} />)).toMatchObject({ min: true, max: false });
        expect(reportedRules(<Input type="number" min={1} max={10} value={11} />)).toMatchObject({ min: false, max: true });
        expect(reportedRules(<Input type="number" min={1} max={10} value={10} />)).toMatchObject({ min: false, max: false });
    });

    it("checks date bounds on timestamps", () => {
        const day = Date.UTC(2026, 9, 18);
        expect(reportedRules(<Input type="date" min={day} value={day - 86400000} />)).toMatchObject({ min: true });
        expect(reportedRules(<Input type="date" max={day} value={day} />)).toMatchObject({ max: false });
    });

    it("checks time bounds in minutes", () => {
        expect(reportedRules(<Input type="time" min={8 * 60} value={7 * 60} />)).toMatchObject({ min: true });
        expect(reportedRules(<Input type="time" max={18 * 60} value={17 * 60} />)).toMatchObject({ max: false });
    });

    it("leaves an empty value to the required rule", () => {
        expect(reportedRules(<Input type="number" min={1} value={null} />)).toMatchObject({ min: false });
        expect(reportedRules(<Input minLength={3} value="" />)).toMatchObject({ minLength: false });
    });

    it("checks lengths on text values", () => {
        expect(reportedRules(<Input minLength={3} value="ab" />)).toMatchObject({ minLength: true });
        expect(reportedRules(<Input length={5} value="12345" />)).toMatchObject({ length: false });
        expect(reportedRules(<Input length={5} value="1234" />)).toMatchObject({ length: true });
        expect(reportedRules(<Input maxLength={3} value="abcd" />)).toMatchObject({ maxLength: true });
    });

    it("matches a string pattern against the whole value", () => {
        expect(reportedRules(<Input pattern="[0-9]{5}" value="75001" />)).toMatchObject({ pattern: false });
        expect(reportedRules(<Input pattern="[0-9]{5}" value="75001x" />)).toMatchObject({ pattern: true });
    });

    it("uses a RegExp pattern as given, even with the g flag", () => {
        const pattern = /^[A-Z]+$/g;
        expect(reportedRules(<Input pattern={pattern} value="ABC" />)).toMatchObject({ pattern: false });
        expect(reportedRules(<Input pattern={pattern} value="ABC" />)).toMatchObject({ pattern: false });
        expect(reportedRules(<Input pattern={pattern} value="abc" />)).toMatchObject({ pattern: true });
    });
});

describe("Input rule messages and native attributes", () => {
    const messageFor = (element) => {
        render({ ...element, props: { ...element.props, onChange: vi.fn(), formSubmitted: true } });
    };

    it("shows the bound in the message, and patternError over the label", () => {
        messageFor(<Input label="Qty" type="number" min={2} value={1} />);
        expect(screen.getByText("The value must be at least 2.")).toBeTruthy();

        messageFor(<Input label="Zip" pattern="[0-9]{5}" patternError="5 digits" value="12" />);
        expect(screen.getByText("5 digits")).toBeTruthy();

        messageFor(<Input label="Start" type="time" min={8 * 60} value={7 * 60} />);
        expect(screen.getByText("The time must be 08:00 or later.")).toBeTruthy();
    });

    it("forwards bounds and limits to the native input", () => {
        render(<Input label="Qty" type="number" min={1} max={9} value={3} onChange={vi.fn()} />);
        const qty = screen.getByLabelText("Qty");
        expect(qty.getAttribute("min")).toBe("1");
        expect(qty.getAttribute("max")).toBe("9");

        render(<Input label="Day" type="date" min={Date.UTC(2026, 9, 18)} value={null} onChange={vi.fn()} />);
        expect(screen.getByLabelText("Day").getAttribute("min")).toBe("2026-10-18");

        render(<Input label="Code" maxLength={4} pattern="[A-Z]+" value="" onChange={vi.fn()} />);
        const code = screen.getByLabelText("Code");
        expect(code.getAttribute("maxlength")).toBe("4");
        expect(code.getAttribute("pattern")).toBe("[A-Z]+");
    });
});
