import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { Array as ArrayField } from "./";

describe("Array - required star slot", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("shows the star when required and styles it through starProps", () => {
        render(<ArrayField label="Tags" required starProps={{ "data-testid": "star", className: "text-blue-500" }} />);
        const star = screen.getByTestId("star");
        expect(star.textContent).toBe("*");
        expect(star.className).toContain("text-blue-500");
    });

    it("still accepts the former requiredStarProps name", () => {
        render(<ArrayField label="Tags" required requiredStarProps={{ "data-testid": "star", className: "text-blue-500" }} />);
        expect(screen.getByTestId("star").className).toContain("text-blue-500");
    });

    it("prefers starProps when both names are given", () => {
        render(
            <ArrayField
                label="Tags"
                required
                starProps={{ "data-testid": "star", className: "text-blue-500" }}
                requiredStarProps={{ "data-testid": "old-star", className: "text-green-500" }}
            />
        );
        expect(screen.getByTestId("star").className).toContain("text-blue-500");
        expect(screen.queryByTestId("old-star")).toBeNull();
    });

    it("renders no star when the field is not required", () => {
        render(<ArrayField label="Tags" starProps={{ "data-testid": "star" }} />);
        expect(screen.queryByTestId("star")).toBeNull();
    });

    it("does not leak the star slot onto the hidden inputs", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        render(<ArrayField label="Tags" required defaultValue={["a"]} starProps={{ className: "x" }} />);
        const unknownProp = consoleError.mock.calls.some(call => call.join(" ").includes("starProps"));
        expect(unknownProp).toBe(false);
    });
});
