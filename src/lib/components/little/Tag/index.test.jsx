import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Tag } from "./";

const background = (text) => screen.getByText(text).style.getPropertyValue("--status-color");
const foreground = (text) => screen.getByText(text).style.getPropertyValue("--status-strong-color");

const theme = readFileSync(resolve(process.cwd(), "src/lib/assets/styles/theme.css"), "utf8");

// Colour variables the light theme defines (`--color-name: value;`).
const definedColors = new Set(Array.from(theme.matchAll(/^\s*(--color-[\w-]+)\s*:/gm), (match) => match[1]));

// The fallback of a reference: the last var() of the chain.
const lastVar = (reference) => reference.match(/var\((--color-[\w-]+)\)+$/)?.[1];

// The `-status` variables are only emitted in the built CSS when a class uses
// them, so a Tag must never depend on them alone.
const BASE_FALLBACKS = {
    success: "--color-success",
    danger: "--color-error",
    warning: "--color-warning",
    info: "--color-primary",
    primary: "--color-primary",
    neutral: "--color-neutral",
    "to-complete": "--color-warning",
    "in-progress": "--color-primary",
    done: "--color-success",
    "to-do": "--color-neutral",
    draft: "--color-warning",
    update: "--color-primary",
};

describe("Tag - color", () => {
    it("defaults to success", () => {
        render(<Tag>Done</Tag>);
        expect(background("Done")).toBe("var(--color-success-status, var(--color-success))");
    });

    it.each(Object.entries(BASE_FALLBACKS))("resolves %s to a palette colour the theme defines", (color, fallback) => {
        render(<Tag color={color}>{color}</Tag>);

        expect(background(color)).toBe(`var(--color-${color}-status, var(${fallback}))`);
        expect(lastVar(background(color))).toBe(fallback);
        expect(lastVar(foreground(color))).toBe(fallback);
        expect(definedColors.has(fallback)).toBe(true);
    });

    it("keeps a theme-defined status colour first", () => {
        render(<Tag color="in-progress">Running</Tag>);
        expect(background("Running").startsWith("var(--color-in-progress-status,")).toBe(true);
        expect(foreground("Running")).toBe("var(--color-strong-in-progress-status, var(--color-strong-primary, var(--color-primary)))");
    });

    it("falls back to neutral for an unknown colour", () => {
        render(<Tag color="purple">Odd</Tag>);
        expect(lastVar(background("Odd"))).toBe("--color-neutral");
        expect(lastVar(foreground("Odd"))).toBe("--color-neutral");
    });

    it("does not read inherited object keys as colours", () => {
        render(<Tag color="constructor">Proto</Tag>);
        expect(lastVar(background("Proto"))).toBe("--color-neutral");
    });
});

describe("Tag - forwarded attributes", () => {
    it("puts data-* and aria-* on the tag element", () => {
        render(<Tag data-testid="status" aria-label="Status: done">Done</Tag>);
        const tag = screen.getByTestId("status");
        expect(tag.textContent).toBe("Done");
        expect(tag.getAttribute("aria-label")).toBe("Status: done");
    });
});
