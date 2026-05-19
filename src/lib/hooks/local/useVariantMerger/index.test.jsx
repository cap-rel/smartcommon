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
