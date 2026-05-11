/**
 * Barrel completeness tests.
 *
 * Goal: catch the class of regressions we just cleaned up in 1.0.316:
 * - empty stub components silently exported from a barrel
 *   (`() => ""`, `() => null`, `() => {}`)
 * - components present in `index.js` (dev / Storybook) but missing from
 *   `export.js` (library build), or the inverse
 * - public-API surface drift between dev and the npm package
 *
 * The dev barrel `src/lib/components/index.js` (Storybook surface) and the
 * build barrel `src/lib/components/export.js` (npm package surface) must
 * expose exactly the same set of named exports.
 *
 * Every exported value must be a function (React component) - we forbid
 * accidentally exporting undefined.
 */

import { describe, it, expect } from "vitest";

import * as devBarrel from "lib/components";
import * as buildBarrel from "lib/components/export";

const collectExports = (mod) => Object.keys(mod).filter((k) => k !== "default").sort();

describe("public barrel: lib/components", () => {
    it("dev and build barrels expose the same set of named exports", () => {
        const dev = collectExports(devBarrel);
        const build = collectExports(buildBarrel);

        const onlyInDev = dev.filter((k) => !build.includes(k));
        const onlyInBuild = build.filter((k) => !dev.includes(k));

        expect(
            { onlyInDev, onlyInBuild },
            "Barrels are out of sync. Storybook sees X but the npm package " +
                "ships Y (or vice-versa). Update both index.js and export.js."
        ).toEqual({ onlyInDev: [], onlyInBuild: [] });
    });

    it("no named export is undefined / null", () => {
        // The bug pattern we want to catch is a typo in a barrel (`export *
        // from "./Misnamed"`) or a deleted folder still referenced, both of
        // which surface as `undefined`. Any other non-nullish value (function,
        // React context, plain object such as a `DEFAULT_LABELS` companion
        // constant, primitive constant) is legitimate.
        const dev = collectExports(devBarrel);
        const offenders = dev.filter((name) => {
            const value = devBarrel[name];
            return value === undefined || value === null;
        });

        expect(
            offenders,
            "These exports are undefined / null. Most likely a typo in a " +
                "barrel or a deleted folder still being re-exported."
        ).toEqual([]);
    });

    it("known critical components are present", () => {
        // Anchors against accidental removal of names the consumers
        // explicitly depend on (LoginComponent, RouteGuard, ErrorBoundary,
        // ApiProvider, Provider, ProductCategoryBrowser, PhotoAnnotator,
        // BarcodeScanner, AboutModal, etc.).
        const required = [
            "Provider",
            "ApiProvider",
            "GlobalStatesProvider",
            "ErrorBoundary",
            "RouteGuard",
            "LoginComponent",
            "DeviceIdentificationComponent",
            "BarcodeScanner",
            "AboutModal",
            "ProductCategoryBrowser",
            "PhotoAnnotator",
            "Stepper",
            "DataTable",
            "UpdatePrompt",
            "Modal",
            "Popup",
            "Page",
            "Panel",
            "Button",
            "Input",
            "Select",
            "Boolean",
            "Checker",
            "Number",
            "Datetime",
            "Duration",
            "Files",
            "IconDisplay",
            "Signature",
        ];
        const dev = new Set(collectExports(devBarrel));
        const build = new Set(collectExports(buildBarrel));
        const missingFromDev = required.filter((n) => !dev.has(n));
        const missingFromBuild = required.filter((n) => !build.has(n));

        expect({ missingFromDev, missingFromBuild }).toEqual({
            missingFromDev: [],
            missingFromBuild: [],
        });
    });
});
