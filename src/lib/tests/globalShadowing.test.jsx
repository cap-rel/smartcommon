/**
 * Global-shadowing safety net.
 *
 * Some exported components share a name with a global JS builtin
 * (Boolean, Number, String, Array, Map, Set, Date, Promise, Error,
 * Object, Symbol, RegExp). Inside the component function scope, that
 * identifier is REBOUND to the React component itself. Any call like
 * `Boolean(x)` made from within the component body therefore invokes
 * the component recursively (passing `x` as `props`) instead of
 * calling the native builtin - and recursion crashes inside
 * useVariantMerger with "Cannot read properties of undefined
 * (reading 'variant')" the moment `x` is not an object.
 *
 * Two layers of protection:
 *
 *   A) Static audit - scans each source file of a shadow-named
 *      component and fails if a call expression `<Name>(...)` is
 *      found anywhere inside it. Catches new occurrences as soon as
 *      they land.
 *
 *   B) Render smoke - tries to render each shadow-named component
 *      with the kind of "minimal / unset" value the consumer is
 *      most likely to pass first (undefined, null, no value at
 *      all). Documents the contract and gives an integration-level
 *      green/red for the audit. Components that fail to mount for
 *      unrelated reasons in this happy-dom environment (e.g. Map
 *      needs Leaflet) are excluded by name.
 *
 * Both sections rely on the REAL useVariantMerger - using the
 * nullSafety global mock would short-circuit the recursion and hide
 * the bug.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Components that intentionally shadow a global. Add a new entry
// when you introduce another shadow-named component.
const SHADOW_COMPONENTS = [
    {
        name: "Boolean",
        sourcePath: "src/lib/components/form/Boolean/index.jsx",
        // Props matrix tried in the render smoke. Each entry is a
        // set of props that should NOT crash the component.
        renderCases: [
            {},
            { value: undefined },
            { value: null },
            { value: true },
            { value: false },
            { type: "checkbox", value: undefined },
            { type: "radio", value: undefined },
            { type: "icon", value: undefined },
            { type: "switch", value: undefined },
        ],
    },
    {
        name: "Array",
        sourcePath: "src/lib/components/form/Array/index.jsx",
        renderCases: [
            {},
            { value: undefined },
            { value: null },
            { value: [] },
        ],
    },
    {
        // formats/Array also exports a component named `Array`. Same
        // shadowing risk, separate file.
        name: "Array",
        sourcePath: "src/lib/components/formats/Array/index.jsx",
        renderCases: [
            {},
            { value: undefined },
            { value: null },
            { value: [] },
            { value: [{ fullname: "Alice" }] },
        ],
    },
    {
        name: "Number",
        sourcePath: "src/lib/components/formats/Number/index.jsx",
        renderCases: [
            {},
            { value: undefined },
            { value: null },
            { value: 0 },
            { value: 42.5 },
        ],
    },
    {
        name: "String",
        sourcePath: "src/lib/components/formats/String/index.jsx",
        renderCases: [
            {},
            { value: undefined },
            { value: null },
            { value: "" },
            { value: "hello" },
        ],
    },
    // Map is excluded from render smoke: it uses Leaflet via a `const
    // L = {}` placeholder and `L.map(...)` always throws under
    // happy-dom. Its source is still scanned in section A.
    {
        name: "Map",
        sourcePath: "src/lib/components/others/Map/index.jsx",
        renderCases: [],
    },
];

// ---- Section A : static audit ---------------------------------------------

describe("Global-shadowing static audit", () => {
    SHADOW_COMPONENTS.forEach(({ name, sourcePath }) => {
        it(`${name}: source must not call \`${name}(...)\` inside its own scope`, () => {
            const absPath = resolve(process.cwd(), sourcePath);
            const source = readFileSync(absPath, "utf8");

            // Strip block comments and line comments so a `// Boolean(x)`
            // or `/* Boolean(x) */` reference does not trip the audit.
            const stripped = source
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .replace(/\/\/[^\n]*/g, "");

            // The component declares itself as `export const <Name> = ...`.
            // Any plain `<Name>(...)` after that point is a recursive
            // call (the local binding shadows the global).
            const declRegex = new RegExp(
                `export\\s+const\\s+${name}\\s*=`,
                "m"
            );
            const declMatch = stripped.match(declRegex);
            expect(
                declMatch,
                `Cannot find \`export const ${name} = ...\` in ${sourcePath}`
            ).toBeTruthy();

            const afterDecl = stripped.slice(declMatch.index);

            // Match `<Name>(` only when it is a standalone identifier
            // (not preceded by `.`, `[`, alpha-num or underscore - so
            // we ignore `something.Boolean(x)` and `MyBoolean(x)`).
            const callRegex = new RegExp(`(^|[^\\w.])${name}\\s*\\(`, "g");
            const calls = [];
            let m;
            while ((m = callRegex.exec(afterDecl)) !== null) {
                // Skip the declaration itself (`<Name> = (props) =>`).
                // The declaration matches `${name}\s*=` not `${name}\s*(`,
                // so it wouldn't be caught anyway. But propTypes ref at
                // the bottom (`<Name>.propTypes = ...`) would also be
                // safe (no parenthesis). So any hit here is a real call.
                const line = afterDecl.slice(0, m.index).split("\n").length;
                calls.push(`line ${line}: ...${afterDecl
                    .slice(Math.max(0, m.index - 10), m.index + 30)
                    .replace(/\n/g, " ")}`);
            }

            expect(
                calls,
                `${name} is self-invoked inside its own scope - this ` +
                    `recursively re-enters the component because the local ` +
                    `binding shadows the native global. Replace ${name}(x) ` +
                    `with a shadow-safe alternative (e.g. !!x for Boolean, ` +
                    `globalThis.${name}(x), or an aliased import).\n` +
                    `Occurrences:\n  ${calls.join("\n  ")}`
            ).toEqual([]);
        });
    });
});

// ---- Section B : render smoke ---------------------------------------------

describe("Global-shadowing render smoke", () => {
    SHADOW_COMPONENTS.forEach(({ name, sourcePath, renderCases }) => {
        if (renderCases.length === 0) return; // intentionally excluded

        // Load the component once per outer describe. We can't import
        // them statically at the top because vitest's vi.mock from
        // other files in the same project could otherwise interfere.
        let Component;
        const loadComponent = async () => {
            if (!Component) {
                // sourcePath -> module path under `lib/`
                const moduleSubpath = sourcePath
                    .replace(/^src\/lib\//, "lib/")
                    .replace(/\/index\.jsx$/, "");
                const mod = await import(/* @vite-ignore */ moduleSubpath);
                Component = mod[name];
            }
            return Component;
        };

        describe(`${name} (${sourcePath})`, () => {
            renderCases.forEach((props, i) => {
                const label = JSON.stringify(props);
                it(`case ${i + 1} renders without recursing into itself: ${label}`, async () => {
                    const C = await loadComponent();
                    expect(C, `${name} not exported from ${sourcePath}`)
                        .toBeDefined();
                    expect(() => render(<C {...props} />)).not.toThrow();
                });
            });
        });
    });
});
