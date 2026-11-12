/**
 * RadioBar accessibility and selection rules.
 *
 * The bar is a set of clickable divs: without ARIA roles a screen reader saw
 * plain text, and the keyboard could not reach or change the choice.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PropTypes from "prop-types";

import { RadioBar } from "./";

const OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

describe("RadioBar - roles", () => {
    it("is a radiogroup named by its visible label", () => {
        render(<RadioBar label="Priority" options={OPTIONS} />);
        const group = screen.getByRole("radiogroup", { name: "Priority" });
        expect(group.querySelectorAll("[role='radio']")).toHaveLength(3);
    });

    it("marks the checked option with aria-checked", () => {
        render(<RadioBar label="Priority" options={OPTIONS} value="medium" onChange={() => {}} />);
        expect(screen.getByRole("radio", { name: "Medium" }).getAttribute("aria-checked")).toBe("true");
        expect(screen.getByRole("radio", { name: "Low" }).getAttribute("aria-checked")).toBe("false");
    });

    it("forwards data-* and aria-* to the radiogroup", () => {
        render(<RadioBar options={OPTIONS} data-testid="priority" aria-label="Priority level" />);
        const group = screen.getByRole("radiogroup", { name: "Priority level" });
        expect(group.getAttribute("data-testid")).toBe("priority");
    });

    it("accepts plain numeric options", () => {
        const onChange = vi.fn();
        render(<RadioBar label="Count" options={[1, 2, 3]} value={2} onChange={onChange} />);
        expect(screen.getByRole("radio", { name: "2" }).getAttribute("aria-checked")).toBe("true");
        fireEvent.click(screen.getByRole("radio", { name: "3" }));
        expect(onChange).toHaveBeenCalledWith(3, expect.anything());
    });
});

describe("RadioBar - roving tabindex", () => {
    it("puts only the first option in the tab order when nothing is checked", () => {
        render(<RadioBar label="Priority" options={OPTIONS} />);
        const tabIndexes = screen.getAllByRole("radio").map(radio => radio.getAttribute("tabindex"));
        expect(tabIndexes).toEqual(["0", "-1", "-1"]);
    });

    it("puts only the checked option in the tab order", () => {
        render(<RadioBar label="Priority" options={OPTIONS} value="high" onChange={() => {}} />);
        const tabIndexes = screen.getAllByRole("radio").map(radio => radio.getAttribute("tabindex"));
        expect(tabIndexes).toEqual(["-1", "-1", "0"]);
    });

    it("takes every option out of the tab order when disabled", () => {
        render(<RadioBar label="Priority" options={OPTIONS} disabled />);
        const tabIndexes = screen.getAllByRole("radio").map(radio => radio.getAttribute("tabindex"));
        expect(tabIndexes).toEqual(["-1", "-1", "-1"]);
    });
});

describe("RadioBar - keyboard", () => {
    it("moves focus and selection with the arrow keys, wrapping around", () => {
        render(<RadioBar label="Priority" options={OPTIONS} defaultValue="low" />);

        fireEvent.keyDown(screen.getByRole("radio", { name: "Low" }), { key: "ArrowRight" });
        const medium = screen.getByRole("radio", { name: "Medium" });
        expect(medium.getAttribute("aria-checked")).toBe("true");
        expect(document.activeElement).toBe(medium);

        fireEvent.keyDown(medium, { key: "ArrowDown" });
        fireEvent.keyDown(screen.getByRole("radio", { name: "High" }), { key: "ArrowRight" });
        expect(screen.getByRole("radio", { name: "Low" }).getAttribute("aria-checked")).toBe("true");

        fireEvent.keyDown(screen.getByRole("radio", { name: "Low" }), { key: "ArrowLeft" });
        expect(screen.getByRole("radio", { name: "High" }).getAttribute("aria-checked")).toBe("true");
        expect(document.activeElement).toBe(screen.getByRole("radio", { name: "High" }));
    });

    it("selects the focused option with Space and Enter", () => {
        const onChange = vi.fn();
        render(<RadioBar label="Priority" options={OPTIONS} onChange={onChange} />);

        fireEvent.keyDown(screen.getByRole("radio", { name: "Medium" }), { key: " " });
        expect(onChange).toHaveBeenLastCalledWith("medium", expect.anything());

        fireEvent.keyDown(screen.getByRole("radio", { name: "High" }), { key: "Enter" });
        expect(onChange).toHaveBeenLastCalledWith("high", expect.anything());
    });

    it("does not change the value from the keyboard when disabled", () => {
        const onChange = vi.fn();
        render(<RadioBar label="Priority" options={OPTIONS} defaultValue="low" disabled onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole("radio", { name: "Low" }), { key: "ArrowRight" });
        fireEvent.keyDown(screen.getByRole("radio", { name: "Medium" }), { key: "Enter" });
        expect(onChange).not.toHaveBeenCalled();
    });

    it("still calls a consumer onKeyDown passed through optionProps", () => {
        const onKeyDown = vi.fn();
        render(<RadioBar label="Priority" options={OPTIONS} optionProps={{ onKeyDown }} />);
        fireEvent.keyDown(screen.getByRole("radio", { name: "Low" }), { key: "ArrowRight" });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });
});

describe("RadioBar - clicking the checked option", () => {
    it("clears the value when the field is optional", () => {
        render(<RadioBar label="Priority" options={OPTIONS} defaultValue="low" />);
        fireEvent.click(screen.getByRole("radio", { name: "Low" }));
        expect(screen.getByRole("radio", { name: "Low" }).getAttribute("aria-checked")).toBe("false");
    });

    it("keeps the value when the field is required", () => {
        const onChange = vi.fn();
        render(<RadioBar label="Priority" options={OPTIONS} defaultValue="low" required onChange={onChange} />);
        fireEvent.click(screen.getByRole("radio", { name: "Low" }));
        expect(screen.getByRole("radio", { name: "Low" }).getAttribute("aria-checked")).toBe("true");
        expect(onChange).not.toHaveBeenCalled();
    });

    it("announces a required group", () => {
        render(<RadioBar label="Priority" options={OPTIONS} required />);
        expect(screen.getByRole("radiogroup", { name: "Priority" }).getAttribute("aria-required")).toBe("true");
    });
});

describe("RadioBar - propTypes", () => {
    // React 19 no longer runs propTypes: check them directly.
    const check = (props) => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        PropTypes.checkPropTypes(RadioBar.propTypes, props, "prop", `RadioBar-${JSON.stringify(props)}`);
        const messages = error.mock.calls.map(args => String(args[0]));
        error.mockRestore();
        return messages;
    };

    it("accepts string and number values", () => {
        expect(check({ value: "low", defaultValue: "low" })).toEqual([]);
        expect(check({ value: 2, defaultValue: 2 })).toEqual([]);
    });

    it("rejects a boolean value", () => {
        expect(check({ value: true })).toHaveLength(1);
    });
});
