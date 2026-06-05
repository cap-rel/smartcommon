import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";

import { ChipBar } from "./";

describe("ChipBar", () => {
    it("renders one button per non-hidden chip with its label and count", () => {
        render(
            <ChipBar
                chips={[
                    { key: "all", label: "All", count: 12, active: true },
                    { key: "mine", label: "Mine", count: 3, active: false },
                ]}
            />
        );

        const all = screen.getByTestId("chip-all");
        const mine = screen.getByTestId("chip-mine");

        expect(all.textContent).toContain("All");
        expect(all.textContent).toContain("(12)");
        expect(mine.textContent).toContain("Mine");
        expect(mine.textContent).toContain("(3)");
    });

    it("does not render hidden chips", () => {
        render(
            <ChipBar
                chips={[
                    { key: "all", label: "All", count: 1 },
                    { key: "ghost", label: "Ghost", count: 0, hidden: true },
                ]}
            />
        );

        expect(screen.queryByTestId("chip-all")).not.toBeNull();
        expect(screen.queryByTestId("chip-ghost")).toBeNull();
    });

    it("defaults missing count to 0", () => {
        render(<ChipBar chips={[{ key: "k", label: "K" }]} />);
        expect(screen.getByTestId("chip-k").textContent).toContain("(0)");
    });

    it("reflects the active state via data-active", () => {
        render(
            <ChipBar
                chips={[
                    { key: "on", label: "On", active: true },
                    { key: "off", label: "Off", active: false },
                ]}
            />
        );

        expect(screen.getByTestId("chip-on").getAttribute("data-active")).toBe("true");
        expect(screen.getByTestId("chip-off").getAttribute("data-active")).toBe("false");
    });

    it("calls the chip onClick when clicked", () => {
        const onClick = vi.fn();
        render(<ChipBar chips={[{ key: "k", label: "K", onClick }]} />);

        fireEvent.click(screen.getByTestId("chip-k"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders a status chip as a square (rounded-md) with its icon", () => {
        const Icon = (props) => <svg data-testid="chip-icon" {...props} />;
        render(
            <ChipBar
                chips={[
                    { key: "done", label: "Done", variant: "status", icon: Icon, active: false },
                ]}
            />
        );

        const chip = screen.getByTestId("chip-done");
        expect(chip.className).toContain("rounded-md");
        expect(screen.getByTestId("chip-icon")).not.toBeNull();
    });

    it("dims a disabled chip but still allows clicks (per spec)", () => {
        const onClick = vi.fn();
        render(<ChipBar chips={[{ key: "k", label: "K", disabled: true, onClick }]} />);

        const chip = screen.getByTestId("chip-k");
        expect(chip.className).toContain("opacity-50");

        fireEvent.click(chip);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders an empty bar when no chips are provided", () => {
        const { container } = render(<ChipBar />);
        const bar = container.querySelector('[data-component="ChipBar"]');
        expect(bar).not.toBeNull();
        expect(bar.querySelectorAll("button").length).toBe(0);
    });
});
