/**
 * Checker accessibility and selection rules.
 *
 * The options were clickable divs with hidden checkboxes: nothing was
 * announced, and the keyboard could neither reach nor toggle them.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PropTypes from "prop-types";

import { Checker } from "./";

const OPTIONS = [
    { value: "mail", label: "Mail" },
    { value: "sms", label: "SMS" },
    { value: "push", label: "Push" },
];

const TYPES = ["switch", "checkbox", "radio", "icon"];

describe("Checker - multiple choice", () => {
    it("is a group of checkboxes named by its label", () => {
        render(<Checker label="Channels" multiple options={OPTIONS} value={["sms"]} onChange={() => {}} />);
        const group = screen.getByRole("group", { name: "Channels" });
        expect(group.querySelectorAll("[role='checkbox']")).toHaveLength(3);
        expect(screen.getByRole("checkbox", { name: "SMS" }).getAttribute("aria-checked")).toBe("true");
        expect(screen.getByRole("checkbox", { name: "Mail" }).getAttribute("aria-checked")).toBe("false");
    });

    it("puts every box in the tab order", () => {
        render(<Checker label="Channels" multiple options={OPTIONS} />);
        expect(screen.getAllByRole("checkbox").map(box => box.getAttribute("tabindex"))).toEqual(["0", "0", "0"]);
    });

    it("toggles with Space and Enter", () => {
        render(<Checker label="Channels" multiple options={OPTIONS} />);
        const mail = screen.getByRole("checkbox", { name: "Mail" });

        fireEvent.keyDown(mail, { key: " " });
        expect(mail.getAttribute("aria-checked")).toBe("true");
        fireEvent.keyDown(mail, { key: "Enter" });
        expect(mail.getAttribute("aria-checked")).toBe("false");
    });

    it.each(TYPES)("keeps the roles with the %s look", (type) => {
        render(<Checker label="Channels" multiple type={type} options={OPTIONS} />);
        expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    });
});

describe("Checker - single choice", () => {
    it("is a radiogroup of radios named by its label", () => {
        render(<Checker label="Contact" options={OPTIONS} value="push" onChange={() => {}} />);
        const group = screen.getByRole("radiogroup", { name: "Contact" });
        expect(group.querySelectorAll("[role='radio']")).toHaveLength(3);
        expect(screen.getByRole("radio", { name: "Push" }).getAttribute("aria-checked")).toBe("true");
    });

    it("uses a roving tabindex", () => {
        const { unmount } = render(<Checker label="Contact" options={OPTIONS} />);
        expect(screen.getAllByRole("radio").map(radio => radio.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
        unmount();

        render(<Checker label="Contact" options={OPTIONS} value="sms" onChange={() => {}} />);
        expect(screen.getAllByRole("radio").map(radio => radio.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    });

    it("moves focus and selection with the arrow keys", () => {
        render(<Checker label="Contact" options={OPTIONS} defaultValue="mail" />);
        fireEvent.keyDown(screen.getByRole("radio", { name: "Mail" }), { key: "ArrowDown" });

        const sms = screen.getByRole("radio", { name: "SMS" });
        expect(sms.getAttribute("aria-checked")).toBe("true");
        expect(document.activeElement).toBe(sms);

        fireEvent.keyDown(sms, { key: "ArrowUp" });
        fireEvent.keyDown(screen.getByRole("radio", { name: "Mail" }), { key: "ArrowUp" });
        expect(screen.getByRole("radio", { name: "Push" }).getAttribute("aria-checked")).toBe("true");
    });

    it("selects with Space", () => {
        const onChange = vi.fn();
        render(<Checker label="Contact" options={OPTIONS} onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole("radio", { name: "SMS" }), { key: " " });
        expect(onChange).toHaveBeenCalledWith("sms", expect.anything());
    });

    it("clears the checked option on click when optional", () => {
        render(<Checker label="Contact" options={OPTIONS} defaultValue="mail" />);
        fireEvent.click(screen.getByRole("radio", { name: "Mail" }));
        expect(screen.getByRole("radio", { name: "Mail" }).getAttribute("aria-checked")).toBe("false");
    });

    it("keeps the checked option when required", () => {
        const onChange = vi.fn();
        render(<Checker label="Contact" required options={OPTIONS} defaultValue="mail" onChange={onChange} />);
        fireEvent.click(screen.getByRole("radio", { name: "Mail" }));
        fireEvent.keyDown(screen.getByRole("radio", { name: "Mail" }), { key: " " });
        expect(screen.getByRole("radio", { name: "Mail" }).getAttribute("aria-checked")).toBe("true");
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("radiogroup").getAttribute("aria-required")).toBe("true");
    });
});

describe("Checker - disabled, attributes and props", () => {
    it("takes the options out of the tab order and ignores the keyboard when disabled", () => {
        const onChange = vi.fn();
        render(<Checker label="Channels" multiple disabled options={OPTIONS} onChange={onChange} />);
        const boxes = screen.getAllByRole("checkbox");

        fireEvent.keyDown(boxes[0], { key: " " });

        expect(onChange).not.toHaveBeenCalled();
        expect(boxes.map(box => box.getAttribute("tabindex"))).toEqual(["-1", "-1", "-1"]);
        expect(boxes[0].getAttribute("aria-disabled")).toBe("true");
    });

    it("forwards data-* and aria-* to the options container", () => {
        render(<Checker options={OPTIONS} multiple data-testid="channels" aria-label="Channels" />);
        expect(screen.getByRole("group", { name: "Channels" }).getAttribute("data-testid")).toBe("channels");
    });

    it("still puts a data-testid given through optionProps on each option", () => {
        render(<Checker label="Channels" multiple options={OPTIONS} optionProps={{ "data-testid": "channel" }} />);
        const options = screen.getAllByTestId("channel");
        expect(options).toHaveLength(3);
        expect(options.every(option => option.getAttribute("role") === "checkbox")).toBe(true);
    });

    it("still calls a consumer onKeyDown passed through optionProps", () => {
        const onKeyDown = vi.fn();
        render(<Checker label="Channels" multiple options={OPTIONS} optionProps={{ onKeyDown }} />);
        fireEvent.keyDown(screen.getByRole("checkbox", { name: "Mail" }), { key: " " });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it("declares string, number and array values in its propTypes", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        PropTypes.checkPropTypes(Checker.propTypes, { value: "a", defaultValue: ["a", "b"] }, "prop", "Checker-values");
        PropTypes.checkPropTypes(Checker.propTypes, { value: 3 }, "prop", "Checker-number");
        const messages = error.mock.calls.map(args => String(args[0]));
        error.mockRestore();
        expect(messages).toEqual([]);
    });
});
