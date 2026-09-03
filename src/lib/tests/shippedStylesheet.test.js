/**
 * Guards what the published stylesheet actually contains.
 *
 * The library build entry (`src/index.js`) used to import the dev app's
 * stylesheet instead of the lib one. Both exist, both look alike, and the dev
 * app + Storybook import the lib copy directly, so nothing was visibly broken
 * in-house -- but every consumer of `@cap-rel/smartcommon/dist/smartcommon-style.css`
 * got a theme whose dark palette equalled the light one (`--color-dark-soft-bg`
 * was `white`) and whose `dark:` utilities were compiled under
 * `@media (prefers-color-scheme: dark)` instead of the `.dark` class that
 * <ThemeApplier> toggles. Result: dark mode was a silent no-op downstream.
 *
 * Two layers here: the source assertion runs in the default `test:run`, the
 * dist assertions run when a build is present (`npm run test:build`).
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const entryPath = resolve(process.cwd(), "src/index.js");
const cssPath = resolve(process.cwd(), "dist/smartcommon-style.css");

// Reads the value of a custom property as declared in the stylesheet, e.g.
// "--color-soft-bg" -> "white". Returns the first declaration found, which is
// the `:root, :host` one emitted from the @theme block.
const declaredValue = (css, name) => {
    const match = css.match(new RegExp(`${name}\\s*:\\s*([^;}]+)`));
    return match ? match[1].trim() : null;
};

describe("Published stylesheet", () => {
    it("the library entry imports the lib stylesheet, not the dev copy", () => {
        const entry = readFileSync(entryPath, "utf8");
        expect(entry).toContain("lib/assets/styles/export.css");
        expect(entry).not.toContain("dev/assets/styles");
    });

    const describeIfBuilt = existsSync(cssPath) ? describe : describe.skip;

    describeIfBuilt("built CSS", () => {
        const css = existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "";

        it("ships a dark palette that actually differs from the light one", () => {
            for (const token of ["soft-bg", "medium-bg", "strong-bg", "strong-text", "border"]) {
                const light = declaredValue(css, `--color-${token}`);
                const dark = declaredValue(css, `--color-dark-${token}`);
                expect(light, `--color-${token} must be declared`).toBeTruthy();
                expect(dark, `--color-dark-${token} must be declared`).toBeTruthy();
                expect(dark, `--color-dark-${token} must differ from --color-${token}`).not.toBe(light);
            }
        });

        it("drives dark utilities from the .dark class, not the OS preference", () => {
            expect(css).not.toContain("prefers-color-scheme:dark");
            expect(css).toMatch(/:where\(\.dark/);
        });

        it("maps the dark brightness filters to the dark brightness tokens", () => {
            // A former typo mapped them to `--color-dark-*`, which does not
            // exist for brightness: the filter resolved to an invalid value and
            // every hover:brightness-soft became a no-op in dark mode.
            const darkBlock = css.match(/\.dark\{[^}]*\}/);
            expect(darkBlock).toBeTruthy();
            expect(darkBlock[0]).toContain("--brightness-soft:var(--brightness-dark-soft)");
        });
    });
});
