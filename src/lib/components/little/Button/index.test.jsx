import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { LibConfigProvider } from "lib/components/app/LibConfigProvider";

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

describe("Button - native variants", () => {
    it.each([
        ["primary", ["bg-primary", "text-white"], []],
        ["secondary", ["bg-secondary", "text-strong-text"], ["bg-primary", "text-white"]],
        ["outline", ["bg-transparent", "text-primary", "border-primary"], ["bg-primary", "text-white"]],
        ["ghost", ["bg-transparent", "text-primary"], ["bg-primary", "text-white", "border-primary"]],
        ["danger", ["bg-error", "text-white"], ["bg-primary"]],
    ])("applies the %s variant over the default colors", (variant, present, absent) => {
        render(<Button variant={variant} label="Go" />);
        const classes = screen.getByRole("button", { name: "Go" }).className.split(/\s+/);
        for (const name of present) expect(classes).toContain(name);
        for (const name of absent) expect(classes).not.toContain(name);
        // The size classes are untouched by a color variant.
        expect(classes).toContain("text-app-base");
    });

    it("lets a module override a native variant through components.variants", () => {
        render(
            <LibConfigProvider value={{ components: { variants: { Button: { danger: { buttonProps: { className: "bg-warning" } } } } } }}>
                <Button variant="danger" label="Delete" />
            </LibConfigProvider>
        );
        const classes = screen.getByRole("button", { name: "Delete" }).className.split(/\s+/);
        expect(classes).toContain("bg-warning");
        expect(classes).not.toContain("bg-error");
    });

    it("keeps the default colors for an unknown variant", () => {
        render(<Button variant="does-not-exist" label="Plain" />);
        const classes = screen.getByRole("button", { name: "Plain" }).className.split(/\s+/);
        expect(classes).toContain("bg-primary");
        expect(classes).toContain("text-white");
    });
});
