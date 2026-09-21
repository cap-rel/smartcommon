/**
 * useVariantMerger smoke + edge case tests.
 *
 * Covers non reproducible bug in isolation: the hook
 * must not crash when LibConfigProvider is absent, when props is an
 * empty object, when props.variant is undefined / null / string /
 * array, and when an unknown variant name is requested.
 *
 * The bug was reported as "Cannot read properties of undefined
 * (reading 'variant')" -- the test cases below exercise every input
 * shape we could think of, and a follow-up code change in the hook
 * itself will add a defensive log if any of these inputs ever does
 * yield undefined intermediates.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import { LibConfigProvider } from "lib/components/app/LibConfigProvider";

import { useVariantMerger } from "./index";

describe("useVariantMerger - defensive smoke", () => {
    it("does not throw without any LibConfigProvider, props={}", () => {
        expect(() =>
            renderHook(() => useVariantMerger("Button", {}))
        ).not.toThrow();
    });

    it("returns the expected shape (variantProps, mergeProps, mergeQuickProps, setParams)", () => {
        const { result } = renderHook(() => useVariantMerger("Button", {}));
        expect(result.current).toEqual(
            expect.objectContaining({
                variantProps: expect.any(Object),
                mergeProps: expect.any(Function),
                mergeQuickProps: expect.any(Function),
                setParams: expect.any(Function),
            })
        );
    });

    it("does not throw when props.variant is undefined", () => {
        expect(() =>
            renderHook(() => useVariantMerger("Button", { variant: undefined }))
        ).not.toThrow();
    });

    it("does not throw when props.variant is null", () => {
        expect(() =>
            renderHook(() => useVariantMerger("Button", { variant: null }))
        ).not.toThrow();
    });

    it("does not throw when props.variant is a string referencing a known smartcommon variant", () => {
        expect(() =>
            renderHook(() => useVariantMerger("Button", { variant: "rounded" }))
        ).not.toThrow();
    });

    it("does not throw when props.variant is an unknown string", () => {
        expect(() =>
            renderHook(() =>
                useVariantMerger("Button", { variant: "no-such-variant" })
            )
        ).not.toThrow();
    });

    it("does not throw when props.variant is an array mixing strings and objects", () => {
        expect(() =>
            renderHook(() =>
                useVariantMerger("Button", {
                    variant: ["rounded", { buttonProps: { className: "test" } }],
                })
            )
        ).not.toThrow();
    });

    it("does not throw when props.variant array contains undefined / null entries", () => {
        expect(() =>
            renderHook(() =>
                useVariantMerger("Button", { variant: [undefined, null, "rounded"] })
            )
        ).not.toThrow();
    });

    it("does not throw for an unknown componentKey", () => {
        expect(() =>
            renderHook(() =>
                useVariantMerger("NoSuchComponent", { variant: "rounded" })
            )
        ).not.toThrow();
    });

    it("mergeProps with an element key returns a plain object", () => {
        const { result } = renderHook(() => useVariantMerger("Button", {}));
        const merged = result.current.mergeProps("container", (p) => ({
            ...p,
            className: "x",
        }));
        expect(merged).toEqual(expect.any(Object));
        expect(merged.className).toContain("x");
    });

    it("mergeProps with a sub-component key returns a plain object", () => {
        const { result } = renderHook(() => useVariantMerger("Button", {}));
        const merged = result.current.mergeProps("Spinner", (p) => ({
            ...p,
            spinnerProps: { className: "y" },
        }));
        expect(merged).toEqual(expect.any(Object));
    });

    it("mergeQuickProps returns the requested keys (default when absent)", () => {
        const { result } = renderHook(() => useVariantMerger("Button", {}));
        const quick = result.current.mergeQuickProps({}, [
            ["size", "md"],
            "kind",
        ]);
        expect(quick.size).toBe("md");
        expect(quick.kind).toBeUndefined();
    });
});

/**
 * Resolution tests: the suite above only ever asserted that the hook does not
 * throw, which is how two defects survived in it.
 *
 *  1. `useLibConfig` was destructured without being called, so nothing declared
 *     under `components` in the LibConfigProvider value was ever read.
 *  2. `toArray` (lodash) was used to normalise `variant` into a list. On a
 *     string it returns one entry per CHARACTER, on an object it returns the
 *     object's values -- so a named variant was looked up letter by letter and
 *     an inline object lost its `<element>Props` level.
 *
 * Every case below fails on the pre-fix code.
 *
 * NOTE: LibConfigProvider takes its configuration through a prop named
 * `value`, not `config`. Passing `config` silently yields an empty context and
 * makes these tests fail for the wrong reason.
 */
describe("useVariantMerger - variant resolution", () => {
    const DANGER = { buttonProps: { className: "bg-red-600" } };

    const value = {
        components: {
            variants: { Button: { danger: DANGER } },
            theme: "corporate",
            themes: { corporate: { Button: "danger" } },
        },
    };

    const wrapper = ({ children }) => (
        <LibConfigProvider value={value}>{children}</LibConfigProvider>
    );

    const classNameFor = (props, options) => {
        const { result } = renderHook(
            () => useVariantMerger("Button", props),
            options
        );

        return result.current.mergeProps("button", (p) => p).className;
    };

    it("applies a native variant named by a bare string", () => {
        expect(classNameFor({ variant: "rounded" })).toContain("rounded-full");
    });

    it("applies a native variant named inside an array", () => {
        expect(classNameFor({ variant: ["rounded"] })).toContain("rounded-full");
    });

    it("applies a variant declared in the LibConfigProvider value", () => {
        expect(classNameFor({ variant: "danger" }, { wrapper })).toContain("bg-red-600");
    });

    it("applies a configured variant named inside an array", () => {
        expect(classNameFor({ variant: ["danger"] }, { wrapper })).toContain("bg-red-600");
    });

    it("applies the variant the active theme maps to the component", () => {
        expect(classNameFor({}, { wrapper })).toContain("bg-red-600");
    });

    it("applies an inline variant object without losing its element props", () => {
        const inline = { buttonProps: { className: "bg-blue-500" } };
        expect(classNameFor({ variant: inline })).toContain("bg-blue-500");
    });

    it("still resolves an unknown variant name to nothing", () => {
        // No active theme here: with `corporate` on, Button would legitimately
        // carry the theme's variant and hide what the unknown name resolved to.
        const noTheme = { components: { variants: { Button: { danger: DANGER } } } };
        const noThemeWrapper = ({ children }) => (
            <LibConfigProvider value={noTheme}>{children}</LibConfigProvider>
        );

        expect(classNameFor({ variant: "does-not-exist" }, { wrapper: noThemeWrapper })).toBe("");
    });
});
