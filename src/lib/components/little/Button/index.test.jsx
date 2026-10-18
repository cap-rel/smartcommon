import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "./";

describe("Button - size", () => {
    it("uses the medium spacing by default", () => {
        render(<Button>Save</Button>);
        const button = screen.getByRole("button", { name: "Save" });
        expect(button.className).toContain("px-app-md");
        expect(button.className).toContain("text-app-base");
    });

    it.each([
        ["sm", "px-app-sm", "text-app-sm"],
        ["lg", "px-app-lg", "text-app-lg"],
    ])("applies the %s spacing and font size only", (size, padding, font) => {
        render(<Button size={size}>Save</Button>);
        const button = screen.getByRole("button", { name: "Save" });
        expect(button.className).toContain(padding);
        expect(button.className).toContain(font);
        expect(button.className).not.toContain("px-app-md");
        expect(button.className).not.toContain("text-app-base");
    });

    it("forwards type to the DOM button", () => {
        render(<Button type="submit">Send</Button>);
        expect(screen.getByRole("button", { name: "Send" }).getAttribute("type")).toBe("submit");
    });
});
