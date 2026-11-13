import { describe, it, expect } from "vitest";

import * as variant from "./variant";
import * as lodashComplement from "./lodashComplement";

describe("mergeClassName", () => {
    it("lets a consumer app-* class replace the default one", () => {
        expect(variant.mergeClassName({ className: "gap-app-lg" }, "flex gap-app-sm")).toEqual({ className: "flex gap-app-lg" });
        expect(variant.mergeClassName({ className: "rounded-app-xl" }, "rounded-app-base")).toEqual({ className: "rounded-app-xl" });
    });
});

describe("convertCSSVar", () => {
    it("returns the var() contents and the value without them", () => {
        expect(variant.convertCSSVar("1px solid var(--border) var(--x)")).toEqual({
            vars: ["--border", "--x"],
            newStr: "1px solid  ",
        });
    });
});

describe("removed empty helpers", () => {
    it("no longer exports functions that did nothing", () => {
        expect(variant.mergeProps).toBeUndefined();
        expect(variant.mergePropsPlus).toBeUndefined();
        expect(lodashComplement.position).toBeUndefined();
    });
});
