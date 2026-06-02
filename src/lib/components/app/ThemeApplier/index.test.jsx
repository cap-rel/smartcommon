import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup, act } from "@testing-library/react";

import { ThemeApplier } from "./";

// jsdom does not implement matchMedia: install a controllable mock.
const installMatchMedia = (matches) => {
    const listeners = new Set();
    const mql = {
        get matches() {
            return matches;
        },
        media: "(prefers-color-scheme: dark)",
        addEventListener: (_, cb) => listeners.add(cb),
        removeEventListener: (_, cb) => listeners.delete(cb),
        // helper for tests to flip the OS preference
        _emit(next) {
            matches = next;
            listeners.forEach((cb) => cb({ matches: next }));
        },
    };
    window.matchMedia = vi.fn().mockReturnValue(mql);
    return mql;
};

describe("ThemeApplier", () => {
    beforeEach(() => {
        document.documentElement.classList.remove("dark");
    });

    afterEach(() => {
        cleanup();
        document.documentElement.classList.remove("dark");
        delete window.matchMedia;
    });

    it("does not add .dark for the default (light) mode", () => {
        render(<ThemeApplier />);
        expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("does not add .dark for mode='light'", () => {
        render(<ThemeApplier mode="light" />);
        expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("adds .dark for mode='dark'", () => {
        render(<ThemeApplier mode="dark" />);
        expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("follows the OS in mode='auto' (dark)", () => {
        installMatchMedia(true);
        render(<ThemeApplier mode="auto" />);
        expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("follows the OS in mode='auto' (light)", () => {
        installMatchMedia(false);
        render(<ThemeApplier mode="auto" />);
        expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("reacts to an OS preference change in mode='auto'", () => {
        const mql = installMatchMedia(false);
        render(<ThemeApplier mode="auto" />);
        expect(document.documentElement.classList.contains("dark")).toBe(false);

        act(() => mql._emit(true));
        expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("removes .dark when switching from dark to light", () => {
        const { rerender } = render(<ThemeApplier mode="dark" />);
        expect(document.documentElement.classList.contains("dark")).toBe(true);

        rerender(<ThemeApplier mode="light" />);
        expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
});
