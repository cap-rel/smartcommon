import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Block } from "./";
import { ViewportContext } from "lib/components/app/ViewportProvider/context";

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

describe("Block - title heading", () => {
    it("renders the title as an h2 heading by default, keeping its classes", () => {
        render(<Block title="Customer"><span>c</span></Block>);
        const heading = screen.getByRole("heading", { level: 2, name: "Customer" });
        expect(heading.className).toContain("font-app-semibold");
        expect(heading.className).toContain("text-strong-text");
    });

    it("renders the title with the element given by titleAs", () => {
        render(<Block title="Lines" titleAs="h3"><span>c</span></Block>);
        expect(screen.getByRole("heading", { level: 3, name: "Lines" })).toBeTruthy();
    });
});

describe("Block - desktop shadow", () => {
    const withViewport = (viewport, ui) => (
        <ViewportContext.Provider value={{ viewport, isMobile: viewport === "mobile", isTablet: viewport === "tablet", isDesktop: viewport === "desktop" }}>
            {ui}
        </ViewportContext.Provider>
    );

    it("keeps its shadows without a ViewportProvider", () => {
        render(<Block><span>content</span></Block>);
        expect(containerOf("content").className).toContain("shadow-md");
        expect(containerOf("content").parentElement.className).toContain("lg:shadow-md");
    });

    it("keeps its shadows in a mobile session", () => {
        render(withViewport("mobile", <Block><span>content</span></Block>));
        expect(containerOf("content").className).toContain("shadow-md");
        expect(containerOf("content").parentElement.className).toContain("lg:shadow-md");
    });

    it("drops every card shadow in a desktop session", () => {
        render(withViewport("desktop", <Block><span>content</span></Block>));
        expect(containerOf("content").className).not.toMatch(/shadow/);
        expect(containerOf("content").parentElement.className).not.toMatch(/shadow/);
    });
});
