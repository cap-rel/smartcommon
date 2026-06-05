/**
 * Input type resolution (todo items 18 & 19).
 *
 * - Meta-types (varchar/int/date/datetime/time/...) map to the right HTML type.
 * - Native HTML types passed directly ("datetime-local", "date", "number",
 *   "color", ...) now pass through instead of silently falling back to "text".
 * - An unknown type still falls back to "text".
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Input } from "./";

const inputTypeFor = (type) => {
    const { container } = render(<Input type={type} value="" onChange={() => {}} />);
    const input = container.querySelector("input");
    expect(input, `no <input> rendered for type=${type}`).not.toBeNull();
    return input.getAttribute("type");
};

describe("Input - meta-type mapping", () => {
    it.each([
        ["varchar", "text"],
        ["email", "email"],
        ["phoneNumber", "tel"],
        ["int", "number"],
        ["float", "number"],
        ["double", "number"],
        ["url", "url"],
        ["search", "search"],
        ["date", "date"],
        ["datetime", "datetime-local"],
        ["time", "time"],
    ])("maps meta-type %s to HTML type %s", (meta, html) => {
        expect(inputTypeFor(meta)).toBe(html);
    });
});

describe("Input - native HTML type pass-through (item 19)", () => {
    it.each([
        "datetime-local",
        "date",
        "time",
        "number",
        "color",
        "month",
        "week",
        "range",
    ])("passes native HTML type %s through unchanged", (html) => {
        expect(inputTypeFor(html)).toBe(html);
    });
});

describe("Input - fallback", () => {
    it("falls back to text for an unknown type", () => {
        expect(inputTypeFor("not-a-real-type")).toBe("text");
    });
});
