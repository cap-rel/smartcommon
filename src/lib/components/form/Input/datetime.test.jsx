import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { Input } from "./";

// A non-UTC zone exposes any UTC/local mismatch between parsing and display.
const originalTZ = process.env.TZ;
beforeAll(() => { process.env.TZ = "Europe/Paris"; });
afterAll(() => { process.env.TZ = originalTZ; });

const roundTrip = (type, typed) => {
    let emitted;
    const { rerender } = render(<Input label="When" type={type} value={undefined} onChange={v => { emitted = v; }} />);
    fireEvent.change(screen.getByLabelText("When"), { target: { value: typed } });
    rerender(<Input label="When" type={type} value={emitted} onChange={vi.fn()} />);
    return screen.getByLabelText("When").value;
};

describe("Input - date and time display", () => {
    it("shows a datetime-local value as typed", () => {
        expect(roundTrip("datetime-local", "2026-10-18T10:00")).toBe("2026-10-18T10:00");
    });

    it("shows a date value as typed", () => {
        expect(roundTrip("date", "2026-10-18")).toBe("2026-10-18");
    });

    it("shows a time value as typed", () => {
        expect(roundTrip("time", "09:45")).toBe("09:45");
    });
});
