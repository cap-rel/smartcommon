import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Block } from "./";

const containerOf = (text) => screen.getByText(text).parentElement;

describe("Block", () => {
    it("renders the boxed card by default", () => {
        render(<Block><span>content</span></Block>);
        expect(containerOf("content").className).toContain("bg-soft-bg");
        expect(containerOf("content").parentElement.className).toContain("my-app-base");
    });

    it("renders an horizontal bar with type title-bar", () => {
        render(<Block type="title-bar"><span>back</span><span>title</span></Block>);
        const bar = containerOf("back");
        expect(bar.className).toContain("flex-row");
        expect(bar.className).not.toContain("bg-soft-bg");
        expect(bar.parentElement.className).not.toContain("my-app-base");
    });

    it("never leaks a false class", () => {
        render(<Block type="title-bar"><span>x</span></Block>);
        expect(containerOf("x").parentElement.className.split(/\s+/)).not.toContain("false");
    });

    it("merges a top-level className over the defaults", () => {
        render(<Block className="my-0 extra"><span>c</span></Block>);
        const container = containerOf("c").parentElement;
        expect(container.className).toContain("extra");
        expect(container.className).not.toContain("my-app-base");
    });
});
