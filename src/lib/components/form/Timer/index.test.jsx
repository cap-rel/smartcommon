import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Timer } from "./";

// The Timer composes <Input> children whose unit labels ("Jours",
// "Heures", "Minutes", "Secondes") are rendered as <label> text by the
// inner <Label> tool. We assert presence/absence on those labels.

describe("Timer - showSeconds default render", () => {
    it("renders all 4 unit inputs (Jours, Heures, Minutes, Secondes) when showSeconds is not passed", () => {
        render(<Timer value={0} onChange={() => {}} />);
        expect(screen.getByText("Jours")).toBeTruthy();
        expect(screen.getByText("Heures")).toBeTruthy();
        expect(screen.getByText("Minutes")).toBeTruthy();
        expect(screen.getByText("Secondes")).toBeTruthy();
    });
});

describe("Timer - showSeconds={false}", () => {
    it("does not render the Secondes input but keeps the 3 other units", () => {
        render(<Timer value={0} onChange={() => {}} showSeconds={false} />);
        expect(screen.getByText("Jours")).toBeTruthy();
        expect(screen.getByText("Heures")).toBeTruthy();
        expect(screen.getByText("Minutes")).toBeTruthy();
        expect(screen.queryByText("Secondes")).toBeNull();
    });

    it("does NOT silently truncate a pre-existing sub-minute value (currentValue stays 125)", () => {
        const onChange = vi.fn();
        const { container } = render(
            <Timer value={125} onChange={onChange} showSeconds={false} />
        );

        // No onChange should have been called at mount: the value is preserved as-is.
        expect(onChange).not.toHaveBeenCalled();

        // The hidden <input name> mirrors currentValue; it must still be 125.
        const hiddenInput = container.querySelector("input[hidden]");
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput.value).toBe("125");

        // Visible unit inputs display the duration breakdown of 125 seconds
        // (2 minutes 5 seconds). The inner <Input> renders an <input> of
        // type "text" (the "number" prop is consumed by the Input wrapper,
        // not forwarded onto the DOM element). We look at all non-hidden
        // text inputs and assert the day/hour/minute breakdown.
        const visibleInputs = container.querySelectorAll(
            'input[type="text"]:not([hidden])'
        );
        expect(visibleInputs.length).toBe(3);
        expect(visibleInputs[0].value).toBe("0");   // days
        expect(visibleInputs[1].value).toBe("00");  // hours
        expect(visibleInputs[2].value).toBe("02");  // minutes
    });

    it("loses pre-existing seconds on the next user edit of Minutes (newValue = newMinutes * 60)", () => {
        const onChange = vi.fn();
        const { container } = render(
            <Timer value={125} onChange={onChange} showSeconds={false} />
        );

        // Edit Minutes from 02 to 03. With showSeconds=false the seconds
        // column is hidden and the pre-existing 5 s residue must be dropped
        // by the edit math: newValue is exactly newMinutes * 60 (180), not
        // 185. This documents the maintainer's intent: editing a duration
        // without a seconds field annuls the pre-existing sub-minute
        // residue on the next user edit.
        const minutesInput = container.querySelectorAll(
            'input[type="text"]:not([hidden])'
        )[2];
        fireEvent.change(minutesInput, { target: { value: "3" } });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(180);
    });

    it("applies opacity-0 on the Minutes suffix when showSeconds is false", () => {
        const { container } = render(
            <Timer value={0} onChange={() => {}} showSeconds={false} />
        );

        // Each unit block renders a children-container with three leaf
        // children in order: prefix ":" (always opacity-0), <input
        // container>, and suffix ":". We locate the Minutes input via its
        // sibling <label> "Minutes", walk up to the unit container, then
        // pick its last leaf "<div>:</div>" (the suffix).
        const minutesLabel = Array.from(container.querySelectorAll("label"))
            .find((el) => el.textContent === "Minutes");
        expect(minutesLabel).toBeTruthy();
        // Parent of label is labelContainer; grandparent is the unit's
        // outer container which holds labelContainer + childrenContainer.
        const unitContainer = minutesLabel.parentElement.parentElement;
        const childrenContainer = unitContainer.children[1];
        const leafDivs = Array.from(childrenContainer.children).filter(
            (el) => el.children.length === 0 && el.textContent === ":"
        );
        // Two leaf ":" divs: prefix and suffix. Both should be opacity-0
        // when the Minutes column is the last visible one.
        expect(leafDivs.length).toBe(2);
        leafDivs.forEach((d) => {
            expect(d.className).toContain("opacity-0");
        });
    });
});
