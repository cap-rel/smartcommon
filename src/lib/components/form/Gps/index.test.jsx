import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";

import { Gps } from "./";

const position = {
    coords: { latitude: 45.75, longitude: 4.85, accuracy: 12 },
    timestamp: 1700000000000,
};

const geolocation = {};

describe("Gps - onLocate", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(globalThis.navigator, "geolocation", "get").mockReturnValue(geolocation);
        geolocation.getCurrentPosition = vi.fn(success => success(position));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    const locate = () => {
        fireEvent.click(screen.getByRole("button"));
        act(() => {
            vi.advanceTimersByTime(1000);
        });
    };

    it("calls onChange with [lat, lng] then onLocate with the full coords and position", () => {
        const calls = [];
        const onChange = vi.fn(value => calls.push(["change", value]));
        const onLocate = vi.fn((coords, raw) => calls.push(["locate", coords, raw]));

        render(<Gps value={null} onChange={onChange} onLocate={onLocate} />);
        locate();

        expect(calls).toEqual([
            ["change", [45.75, 4.85]],
            ["locate", position.coords, position],
        ]);
    });

    it("still works without onLocate", () => {
        const onChange = vi.fn();

        render(<Gps value={null} onChange={onChange} />);
        locate();

        expect(onChange).toHaveBeenCalledWith([45.75, 4.85], expect.anything());
    });

    it("does not call onLocate when geolocation fails", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        geolocation.getCurrentPosition = vi.fn((success, error) => error({ code: 1 }));
        const onLocate = vi.fn();

        render(<Gps value={null} onChange={vi.fn()} onLocate={onLocate} />);
        locate();

        expect(onLocate).not.toHaveBeenCalled();
    });
});

describe("Gps - empty point", () => {
    const rules = (value) => {
        const onError = vi.fn();
        render(<Gps required value={value} onChange={vi.fn()} onError={onError} />);
        return Object.fromEntries(onError.mock.calls);
    };

    it.each([[null], [["", ""]], [[null, null]]])("treats %o as empty", (value) => {
        expect(rules(value)).toEqual({ required: true });
    });

    it("accepts a located point", () => {
        expect(rules([45.75, 4.85])).toEqual({ required: false });
    });

    it("shows the empty state for blank coordinates", () => {
        render(<Gps value={["", ""]} onChange={vi.fn()} />);
        expect(screen.getByText("No location saved")).toBeTruthy();
    });
});

describe("Gps - hidden inputs", () => {
    it.each([[null], [undefined], [[null, null]]])("render %o without React value warnings", (value) => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const { container } = render(<Gps name="position" value={value} onChange={vi.fn()} />);

        const hidden = container.querySelectorAll("input[name='position']");
        expect([...hidden].map(input => input.value)).toEqual(["", ""]);
        expect(consoleError).not.toHaveBeenCalled();
        consoleError.mockRestore();
    });
});
