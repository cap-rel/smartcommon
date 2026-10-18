/**
 * Validation rules of the form fields, observed through the `onError`
 * channel of useField: each rule reports (ruleKey, conditionBoolean), where
 * `true` means the rule fails.
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

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
