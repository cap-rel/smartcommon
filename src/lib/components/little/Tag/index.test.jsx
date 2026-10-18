import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Tag } from "./";

describe("Tag - color", () => {
    it("defaults to the success status color", () => {
        render(<Tag>Done</Tag>);
        expect(screen.getByText("Done").style.getPropertyValue("--status-color")).toBe("var(--color-success-status)");
    });

    it("uses the given color", () => {
        render(<Tag color="danger">Late</Tag>);
        expect(screen.getByText("Late").style.getPropertyValue("--status-color")).toBe("var(--color-danger-status)");
    });
});
