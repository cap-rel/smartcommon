/**
 * Boolean accessibility.
 *
 * The toggle was a div with onClick: not announced, not reachable with Tab,
 * and Space did nothing. The drawn control is now the focusable element.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Boolean as BooleanField } from "./index";

describe("Boolean - accessibility", () => {
    it("is a switch named by its label by default", () => {
        render(<BooleanField label="Notifications" value={true} onChange={() => {}} />);
        const control = screen.getByRole("switch", { name: "Notifications" });
        expect(control.getAttribute("aria-checked")).toBe("true");
        expect(control.getAttribute("tabindex")).toBe("0");
    });

    it.each(["checkbox", "radio", "icon"])("is a checkbox with the %s look", (type) => {
        render(<BooleanField type={type} label="Accept" value={false} onChange={() => {}} />);
        expect(screen.getByRole("checkbox", { name: "Accept" }).getAttribute("aria-checked")).toBe("false");
    });

    it("toggles with Space", () => {
        const onChange = vi.fn();
        render(<BooleanField label="Notifications" onChange={onChange} />);
        const control = screen.getByRole("switch", { name: "Notifications" });

        fireEvent.keyDown(control, { key: " " });
        expect(onChange).toHaveBeenLastCalledWith(true, expect.anything());
        expect(control.getAttribute("aria-checked")).toBe("true");

        fireEvent.keyDown(control, { key: " " });
        expect(onChange).toHaveBeenLastCalledWith(false, expect.anything());
    });

    it("ignores Space when disabled and leaves the tab order", () => {
        const onChange = vi.fn();
        render(<BooleanField label="Notifications" disabled onChange={onChange} />);
        const control = screen.getByRole("switch", { name: "Notifications" });

        fireEvent.keyDown(control, { key: " " });

        expect(onChange).not.toHaveBeenCalled();
        expect(control.getAttribute("tabindex")).toBe("-1");
        expect(control.getAttribute("aria-disabled")).toBe("true");
    });

    it("forwards data-* and aria-* to the focusable control", () => {
        render(<BooleanField type="checkbox" aria-label="Accept the terms" data-testid="terms" />);
        const control = screen.getByRole("checkbox", { name: "Accept the terms" });
        expect(control.getAttribute("data-testid")).toBe("terms");
    });

    it("still calls a consumer onKeyDown passed through the control slot", () => {
        const onKeyDown = vi.fn();
        render(<BooleanField label="Notifications" switchProps={{ onKeyDown }} />);
        fireEvent.keyDown(screen.getByRole("switch", { name: "Notifications" }), { key: " " });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it("toggles when its label text is clicked, like a native label", () => {
        const onChange = vi.fn();
        render(<BooleanField type="checkbox" label="Stay signed in" onChange={onChange} />);

        fireEvent.click(screen.getByText("Stay signed in"));
        expect(onChange).toHaveBeenLastCalledWith(true, expect.anything());
        expect(screen.getByRole("checkbox", { name: "Stay signed in" }).getAttribute("aria-checked")).toBe("true");

        fireEvent.click(screen.getByText("Stay signed in"));
        expect(onChange).toHaveBeenLastCalledWith(false, expect.anything());
    });

    it("ignores a label click when disabled or read only", () => {
        const onChange = vi.fn();
        const { rerender } = render(<BooleanField label="Notifications" disabled onChange={onChange} />);
        fireEvent.click(screen.getByText("Notifications"));
        rerender(<BooleanField label="Notifications" readOnly onChange={onChange} />);
        fireEvent.click(screen.getByText("Notifications"));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("still calls a consumer onClick passed through the label slot", () => {
        const onClick = vi.fn();
        const onChange = vi.fn();
        render(<BooleanField label="Notifications" labelProps={{ onClick }} onChange={onChange} />);
        fireEvent.click(screen.getByText("Notifications"));
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(true, expect.anything());
    });

    it("announces a required field", () => {
        render(<BooleanField type="checkbox" label="Accept" required />);
        expect(screen.getByRole("checkbox", { name: "Accept" }).getAttribute("aria-required")).toBe("true");
    });
});
