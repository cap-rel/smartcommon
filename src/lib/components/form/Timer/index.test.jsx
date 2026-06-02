import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Timer } from "./";

// The Timer renders one tappable cell per visible unit. Each cell shows the
// unit label ("Jours", "Heures", "Minutes", "Secondes"). Tapping a cell opens
// a combined wheel panel with one scrollable column per unit; tapping a value
// in a column selects it (live update).

describe("Timer - closed display", () => {
    it("renders all 4 unit cells when showSeconds is not passed", () => {
        render(<Timer value={0} onChange={() => {}} />);
        expect(screen.getByText("Jours")).toBeTruthy();
        expect(screen.getByText("Heures")).toBeTruthy();
        expect(screen.getByText("Minutes")).toBeTruthy();
        expect(screen.getByText("Secondes")).toBeTruthy();
    });

    it("does not render the Secondes cell but keeps the 3 other units when showSeconds={false}", () => {
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

        // No onChange at mount: the value is preserved as-is.
        expect(onChange).not.toHaveBeenCalled();

        // The hidden <input name> mirrors currentValue; it must still be 125.
        const hiddenInput = container.querySelector("input[hidden]");
        expect(hiddenInput).not.toBeNull();
        expect(hiddenInput.value).toBe("125");

        // 125 seconds = 0 d / 00 h / 02 min: the cells display the breakdown.
        expect(container.querySelector('[data-timer-cell="days"]').textContent).toContain("0");
        expect(container.querySelector('[data-timer-cell="hours"]').textContent).toContain("00");
        expect(container.querySelector('[data-timer-cell="minutes"]').textContent).toContain("02");
    });
});

describe("Timer - wheel panel", () => {
    it("opens the combined panel on cell tap and renders a column per visible unit", () => {
        const { container } = render(<Timer value={0} onChange={() => {}} />);

        // Closed by default: no options yet.
        expect(container.querySelector("[data-unit]")).toBeNull();

        fireEvent.click(container.querySelector('[data-timer-cell="minutes"]'));

        // Panel open: every unit has its own column of options.
        expect(container.querySelector('[data-unit="days"]')).not.toBeNull();
        expect(container.querySelector('[data-unit="hours"]')).not.toBeNull();
        expect(container.querySelector('[data-unit="minutes"]')).not.toBeNull();
        expect(container.querySelector('[data-unit="seconds"]')).not.toBeNull();
    });

    it("does not open when disabled", () => {
        const { container } = render(<Timer value={0} onChange={() => {}} disabled />);
        fireEvent.click(container.querySelector('[data-timer-cell="minutes"]'));
        expect(container.querySelector("[data-unit]")).toBeNull();
    });

    it("selecting a minutes value updates currentValue (live)", () => {
        const onChange = vi.fn();
        const { container } = render(<Timer value={0} onChange={onChange} />);

        fireEvent.click(container.querySelector('[data-timer-cell="minutes"]'));
        fireEvent.click(container.querySelector('[data-unit="minutes"][data-value="15"]'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(15 * 60);
    });

    it("loses pre-existing seconds when picking Minutes with showSeconds={false}", () => {
        const onChange = vi.fn();
        const { container } = render(
            <Timer value={125} onChange={onChange} showSeconds={false} />
        );

        // 125 s = 2 min 5 s. Picking 3 minutes must yield exactly 180 s
        // (the 5 s residue is dropped because the seconds column is hidden).
        fireEvent.click(container.querySelector('[data-timer-cell="minutes"]'));
        fireEvent.click(container.querySelector('[data-unit="minutes"][data-value="3"]'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(180);
    });

    it("does not render a seconds column when showSeconds={false}", () => {
        const { container } = render(<Timer value={0} onChange={() => {}} showSeconds={false} />);
        fireEvent.click(container.querySelector('[data-timer-cell="minutes"]'));
        expect(container.querySelector('[data-unit="seconds"]')).toBeNull();
    });

    it("caps the days column to maxDays", () => {
        const { container } = render(<Timer value={0} onChange={() => {}} maxDays={3} />);
        fireEvent.click(container.querySelector('[data-timer-cell="days"]'));
        const dayOptions = container.querySelectorAll('[data-unit="days"]');
        // 0,1,2,3 -> 4 options
        expect(dayOptions.length).toBe(4);
    });
});
