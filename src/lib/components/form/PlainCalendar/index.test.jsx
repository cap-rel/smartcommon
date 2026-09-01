import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { PlainCalendar } from "./";

// Helper: click the cell of a specific ISO date (YYYY-MM-DD).
// Targets the inner clickable div that carries the onClick handler.
const clickDay = (container, isoDate) => {
    const wrapper = container.querySelector(`[data-date="${isoDate}"]`);
    if (!wrapper) throw new Error(`Day cell not found: ${isoDate}`);
    // The clickable element is the direct child div (the "number" cell)
    const numberCell = wrapper.firstElementChild;
    fireEvent.click(numberCell);
    return wrapper;
};

const navButtons = (container) => container.querySelectorAll("button");

describe("PlainCalendar - rendering", () => {
    it("renders 7 weekday headers from default labels (english)", () => {
        const { container } = render(
            <PlainCalendar value="2024-03-15" onChange={() => {}} />
        );
        expect(screen.getByText("Mon")).toBeTruthy();
        expect(screen.getByText("Tue")).toBeTruthy();
        expect(screen.getByText("Wed")).toBeTruthy();
        expect(screen.getByText("Thu")).toBeTruthy();
        expect(screen.getByText("Fri")).toBeTruthy();
        expect(screen.getByText("Sat")).toBeTruthy();
        expect(screen.getByText("Sun")).toBeTruthy();
        // The grid is 7 columns
        expect(container.querySelector(".grid-cols-7")).toBeTruthy();
    });

    it("uses labels.weekdays override when provided", () => {
        render(
            <PlainCalendar
                value="2024-03-15"
                onChange={() => {}}
                labels={{ weekdays: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."] }}
            />
        );
        expect(screen.getByText("lun.")).toBeTruthy();
        expect(screen.getByText("dim.")).toBeTruthy();
        expect(screen.queryByText("Mon")).toBeNull();
    });

    it("renders the year of the controlled value", () => {
        const { container } = render(
            <PlainCalendar value="2024-03-15" onChange={() => {}} />
        );
        // Year is rendered as text next to its select
        expect(container.textContent).toContain("2024");
    });

    it("marks days outside the current month with data-outside-month='true'", () => {
        const { container } = render(
            <PlainCalendar value="2024-03-15" onChange={() => {}} />
        );
        // March 2024: 1st is a Friday -> firstDayIndex (mon=0) = 4
        // The grid prefixes 4 cells from february (26,27,28,29)
        const feb29 = container.querySelector('[data-date="2024-02-29"]');
        expect(feb29).toBeTruthy();
        expect(feb29.getAttribute("data-outside-month")).toBe("true");

        const mar1 = container.querySelector('[data-date="2024-03-01"]');
        expect(mar1).toBeTruthy();
        expect(mar1.getAttribute("data-outside-month")).toBe("false");
    });
});

describe("PlainCalendar - day click (single mode)", () => {
    it("calls onChange with the clicked day in YYYY-MM-DD when interval=false", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlainCalendar value="2024-03-15" interval={false} onChange={onChange} />
        );
        clickDay(container, "2024-03-20");
        expect(onChange.mock.calls[0][0]).toBe("2024-03-20");
    });

    it("clears the selection when the already-selected day is re-clicked", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlainCalendar value="2024-03-15" interval={false} onChange={onChange} />
        );
        // Re-tapping the selected day must emit onChange(null) so a consumer can
        // deselect. Without the toggle, useField dedupes the unchanged value and
        // onChange would never fire.
        clickDay(container, "2024-03-15");
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBe(null);
    });

    it("selects a day of the previous month and moves the grid onto it", () => {
        const onChange = vi.fn();
        const onMonthChange = vi.fn();
        const { container } = render(
            <PlainCalendar
                value="2024-03-15"
                interval={false}
                onChange={onChange}
                onMonthChange={onMonthChange}
            />
        );
        // 2024-02-29 is a leading prev-month cell. It carries the same look as
        // any other day (and possibly an item badge), so a tap must select it
        // instead of doing nothing; the grid follows onto February.
        clickDay(container, "2024-02-29");
        expect(onChange.mock.calls[0][0]).toBe("2024-02-29");
        expect(onMonthChange).toHaveBeenLastCalledWith(2);
        expect(container.querySelector('[data-date="2024-02-29"]').getAttribute("data-outside-month")).toBe("false");
    });

    it("selects a day of the next month and moves the grid onto it", () => {
        const onChange = vi.fn();
        const onMonthChange = vi.fn();
        const { container } = render(
            <PlainCalendar
                value="2024-04-15"
                interval={false}
                onChange={onChange}
                onMonthChange={onMonthChange}
            />
        );
        // April 2024 starts on a Monday and has 30 days -> the grid trails with
        // 2024-05-01..05.
        clickDay(container, "2024-05-01");
        expect(onChange.mock.calls[0][0]).toBe("2024-05-01");
        expect(onMonthChange).toHaveBeenLastCalledWith(5);
    });

    it("rolls the year over when tapping a december cell shown in january", () => {
        const onChange = vi.fn();
        const onYearChange = vi.fn();
        const { container } = render(
            <PlainCalendar
                value="2025-01-15"
                interval={false}
                onChange={onChange}
                onYearChange={onYearChange}
            />
        );
        // January 2025 starts on a Wednesday -> 2024-12-30 and 31 lead the grid.
        clickDay(container, "2024-12-31");
        expect(onChange.mock.calls[0][0]).toBe("2024-12-31");
        expect(onYearChange).toHaveBeenLastCalledWith(2024);
    });
});

describe("PlainCalendar - interval mode", () => {
    it("first click stores origin and emits the single day", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlainCalendar value={null} interval={true} onChange={onChange} />
        );
        // Render month is "today" but we pick from the visible grid.
        // Click any current-month cell.
        const firstCurrent = container.querySelector('[data-outside-month="false"]');
        expect(firstCurrent).toBeTruthy();
        const isoDate = firstCurrent.getAttribute("data-date");
        fireEvent.click(firstCurrent.firstElementChild);
        expect(onChange.mock.calls[0][0]).toBe(isoDate);
    });

    it("second click on a different day builds an interval [min,max]", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlainCalendar value="2024-03-10" interval={true} onChange={onChange} />
        );
        clickDay(container, "2024-03-20");
        expect(onChange.mock.calls[0][0]).toEqual(["2024-03-10", "2024-03-20"]);
    });

    it("clicking a date before the current single value sorts the interval", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlainCalendar value="2024-03-20" interval={true} onChange={onChange} />
        );
        clickDay(container, "2024-03-10");
        expect(onChange.mock.calls[0][0]).toEqual(["2024-03-10", "2024-03-20"]);
    });

    it("clicking on the same single day clears the selection", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlainCalendar value="2024-03-15" interval={true} onChange={onChange} />
        );
        clickDay(container, "2024-03-15");
        expect(onChange.mock.calls[0][0]).toBeNull();
    });

    it("clicking on a boundary of an existing interval collapses it to that day", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlainCalendar value={["2024-03-10", "2024-03-20"]} interval={true} onChange={onChange} />
        );
        clickDay(container, "2024-03-10");
        expect(onChange.mock.calls[0][0]).toBe("2024-03-10");
    });
});

describe("PlainCalendar - navigation", () => {
    it("Next button advances the month", () => {
        const onMonthChange = vi.fn();
        const { container } = render(
            <PlainCalendar
                value="2024-03-15"
                onChange={() => {}}
                onMonthChange={onMonthChange}
            />
        );
        // onMonthChange fires once on mount with the initial month (3)
        expect(onMonthChange).toHaveBeenLastCalledWith(3);

        const buttons = navButtons(container);
        fireEvent.click(buttons[1]); // Next
        expect(onMonthChange).toHaveBeenLastCalledWith(4);
    });

    it("Previous button rewinds the month", () => {
        const onMonthChange = vi.fn();
        const { container } = render(
            <PlainCalendar
                value="2024-03-15"
                onChange={() => {}}
                onMonthChange={onMonthChange}
            />
        );
        const buttons = navButtons(container);
        fireEvent.click(buttons[0]); // Previous
        expect(onMonthChange).toHaveBeenLastCalledWith(2);
    });

    it("Next on december rolls over to january of next year", () => {
        const onMonthChange = vi.fn();
        const onYearChange = vi.fn();
        const { container } = render(
            <PlainCalendar
                value="2024-12-15"
                onChange={() => {}}
                onMonthChange={onMonthChange}
                onYearChange={onYearChange}
            />
        );
        const buttons = navButtons(container);
        fireEvent.click(buttons[1]);
        expect(onMonthChange).toHaveBeenLastCalledWith(1);
        expect(onYearChange).toHaveBeenLastCalledWith(2025);
    });

    it("Previous on january rolls back to december of previous year", () => {
        const onMonthChange = vi.fn();
        const onYearChange = vi.fn();
        const { container } = render(
            <PlainCalendar
                value="2024-01-15"
                onChange={() => {}}
                onMonthChange={onMonthChange}
                onYearChange={onYearChange}
            />
        );
        const buttons = navButtons(container);
        fireEvent.click(buttons[0]);
        expect(onMonthChange).toHaveBeenLastCalledWith(12);
        expect(onYearChange).toHaveBeenLastCalledWith(2023);
    });
});

describe("PlainCalendar - items badge", () => {
    it("renders a badge counting items that match a given date", () => {
        // items are ms-timestamps OR Date-parseable strings; the component
        // normalises via toMsTimestamp + ISOFormat.
        const day = new Date("2024-03-20T10:00:00Z");
        const { container } = render(
            <PlainCalendar
                value="2024-03-15"
                items={[day, day, day]}
                onChange={() => {}}
            />
        );
        const wrapper = container.querySelector('[data-date="2024-03-20"]');
        expect(wrapper).toBeTruthy();
        // Badge is the inner div whose text is the count
        expect(wrapper.textContent).toContain("3");
    });

    it("does not render a badge when no item matches", () => {
        const { container } = render(
            <PlainCalendar
                value="2024-03-15"
                items={[]}
                onChange={() => {}}
            />
        );
        const wrapper = container.querySelector('[data-date="2024-03-20"]');
        // Cell content should only contain the day number "20", no extra digits
        expect(wrapper.textContent.trim()).toBe("20");
    });
});

// Regression guards
// The crash actually only happens on the minified bundle (the destructure
// inline defaults are dropped by the minifier). On the source these
// defaults work, so the tests below pass today. They protect against
// regressions of the defaults themselves; the real Bug 1 reproduction
// runs against dist/ from src/lib/tests/builtBundle.test.jsx (test:build).
describe("PlainCalendar - default props smoke", () => {
    it("renders without any props", () => {
        expect(() => render(<PlainCalendar />)).not.toThrow();
    });

    it("renders with only a value (no yearsInterval)", () => {
        expect(() => render(<PlainCalendar value="2026-05-19" />)).not.toThrow();
    });

    it("renders when yearsInterval is explicitly undefined", () => {
        expect(() =>
            render(<PlainCalendar value="2026-05-19" yearsInterval={undefined} />)
        ).not.toThrow();
    });

    it("renders when items is explicitly undefined", () => {
        expect(() =>
            render(<PlainCalendar value="2026-05-19" items={undefined} />)
        ).not.toThrow();
    });
});
