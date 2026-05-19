/**
 * Boolean - regression tests for the self-shadowing-global bug.
 *
 * The component is exported as `Boolean`, which inside the function
 * scope rebinds the identifier `Boolean` to the React component
 * itself. Calls like `Boolean(currentValue)` therefore DO NOT call
 * the native `globalThis.Boolean` constructor - they recursively
 * invoke the component, with `currentValue` passed as `props`. When
 * `currentValue` is undefined / null / a non-object, the recursive
 * call eventually crashes inside `useVariantMerger` on
 * `...toArray(props.variant)` with:
 *
 *   TypeError: Cannot read properties of undefined (reading 'variant')
 *
 * The tests below render <Boolean> with `value={undefined}` for every
 * `type` variant. On main these all crash; once the source uses
 * `!!currentValue` (or aliases the native), they go green.
 *
 * No global hook mocks are used here on purpose - we need the real
 * useVariantMerger to expose the recursion path.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Boolean as BooleanComponent } from "./index";

const types = ["checkbox", "radio", "icon", "switch", undefined];

describe("Boolean - shadowing-recursion regression (Boolean as global)", () => {
    types.forEach((type) => {
        const label = type ?? "default (switch)";

        it(`renders with type="${label}" and value=undefined without recursing into itself`, () => {
            expect(() =>
                render(<BooleanComponent type={type} value={undefined} />)
            ).not.toThrow();
        });

        it(`renders with type="${label}" and value=null`, () => {
            expect(() =>
                render(<BooleanComponent type={type} value={null} />)
            ).not.toThrow();
        });

        it(`renders with type="${label}" and no value prop at all`, () => {
            expect(() =>
                render(<BooleanComponent type={type} />)
            ).not.toThrow();
        });
    });

    it("renders correctly when value=true (sanity)", () => {
        expect(() =>
            render(<BooleanComponent type="switch" value={true} />)
        ).not.toThrow();
    });

    it("renders correctly when value=false (sanity)", () => {
        expect(() =>
            render(<BooleanComponent type="checkbox" value={false} />)
        ).not.toThrow();
    });

    it("accepts truthy non-boolean values (string, number) without recursing", () => {
        // These are the values that would trigger the recursion most
        // visibly: a non-undefined non-object, so `Boolean(currentValue)`
        // (the shadowed call) would invoke the component with a string
        // as `props`, and the hook would then crash on `props.variant`.
        expect(() =>
            render(<BooleanComponent type="switch" value="truthy" />)
        ).not.toThrow();
        expect(() =>
            render(<BooleanComponent type="switch" value={1} />)
        ).not.toThrow();
    });
});
