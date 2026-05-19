/**
 * Built-bundle smoke test (test:build script).
 *
 * Loads the actual minified library bundle from `dist/` and renders a
 * handful of components with minimal props. Reproduces the kind of
 * runtime crash described : when a build/minifier
 * change silently drops inline destructure defaults, the source-level
 * tests still pass but consumers of the npm package crash.
 *
 * Runs only when `dist/smartcommon.es.js` exists. The `npm run test:build`
 * script builds first, then runs this file.
 *
 * Skipped by `npm run test:run` (the default test command) to keep
 * the developer loop fast and to avoid false negatives when dist/ is
 * stale.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const distPath = resolve(process.cwd(), "dist/smartcommon.es.js");
const distAvailable = existsSync(distPath);

const describeIfDist = distAvailable ? describe : describe.skip;

if (!distAvailable) {
    console.warn(
        `[builtBundle.test] dist/smartcommon.es.js not found - skipping ` +
            `built-bundle smoke tests. Run \`npm run build\` first or use ` +
            `\`npm run test:build\`.`
    );
}

describeIfDist("Built bundle - smoke render of representative components", () => {
    // Cache the bundle import across tests in the suite.
    let bundle;

    const loadBundle = async () => {
        if (!bundle) {
            bundle = await import(pathToFileURL(distPath).href);
        }
        return bundle;
    };

    it("re-exports PlainCalendar", async () => {
        const mod = await loadBundle();
        expect(mod.PlainCalendar).toBeDefined();
    });

    it("PlainCalendar renders with only a value (no yearsInterval, no items)", async () => {
        const { PlainCalendar } = await loadBundle();
        expect(() => render(<PlainCalendar value="2026-05-19" />)).not.toThrow();
    });

    it("PlainCalendar renders without any props", async () => {
        const { PlainCalendar } = await loadBundle();
        expect(() => render(<PlainCalendar />)).not.toThrow();
    });

    it("PlainCalendar renders with yearsInterval explicitly undefined", async () => {
        const { PlainCalendar } = await loadBundle();
        expect(() =>
            render(<PlainCalendar value="2026-05-19" yearsInterval={undefined} />)
        ).not.toThrow();
    });

    // Audit list: "other components that rely on
    // inline defaults". Render each one with minimal props to catch
    // any equivalent drop.
    it("Datetime (formats) renders with only a value", async () => {
        const { Datetime } = await loadBundle();
        expect(() =>
            render(<Datetime value="2026-05-19T12:00:00Z" />)
        ).not.toThrow();
    });

    it("Duration (formats) renders with only a value", async () => {
        const { Duration } = await loadBundle();
        expect(() => render(<Duration value={90} />)).not.toThrow();
    });

    it("Number (formats) renders with only a value", async () => {
        const { Number: NumberFormat } = await loadBundle();
        expect(() => render(<NumberFormat value={42.5} />)).not.toThrow();
    });

    it("Files (formats) renders with only a value", async () => {
        const { Files } = await loadBundle();
        expect(() => render(<Files value={[]} />)).not.toThrow();
    });

    it("Signature (formats) renders with only a value", async () => {
        const { Signature } = await loadBundle();
        expect(() =>
            render(<Signature value="https://example.com/s.png" />)
        ).not.toThrow();
    });
});
