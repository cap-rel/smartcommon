/**
 * defaultProps / code default consistency.
 *
 * React 19 ignores `defaultProps` on function components: the default that
 * applies is the one written in the destructuring of index.jsx. When the two
 * disagree, the documented value (props.js, docs) is silently wrong. This
 * test compares, for every component exporting `defaultProps`, each simple
 * literal default (boolean, number, string) with the destructuring default
 * of the same prop in its index.jsx, and lists every mismatch.
 */

import { describe, it, expect } from "vitest";

const propsModules = import.meta.glob("../components/**/props.js", { eager: true });
const sources = import.meta.glob("../components/**/index.jsx", { query: "?raw", import: "default", eager: true });

const LITERAL = String.raw`true|false|-?\d+(?:\.\d+)?|"[^"\n]*"|'[^'\n]*'|\`[^\`$\n]*\``;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseLiteral = (text) => {
    if (text === "true") return true;
    if (text === "false") return false;
    if (/^-?\d/.test(text)) return globalThis.Number(text);
    return text.slice(1, -1);
};

// Line and block comments would otherwise yield stale "defaults".
const stripComments = (source) => source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\w])\/\/.*$/gm, "$1");

// Bodies of object destructuring patterns: `{ ... } = value` and a function
// parameter `({ ... }) =>`. Braces are matched by depth, so defaults holding
// an object (`qrbox = { width: 280 }`) or a function (`onChange = () => {}`)
// stay inside their pattern. Restricting the search to these bodies keeps
// JSX attributes (`className="..."`) and plain assignments out.
const destructuringBodies = (source) => {
    const bodies = [];
    for (let start = source.indexOf("{"); start !== -1; start = source.indexOf("{", start + 1)) {
        let depth = 0;
        let end = start;
        for (; end < source.length; end++) {
            if (source[end] === "{") depth++;
            else if (source[end] === "}" && --depth === 0) break;
        }
        if (end >= source.length) break;

        const after = source.slice(end + 1);
        const isAssignment = /^\s*=(?![=>])/.test(after);
        const isParameter = /\(\s*$/.test(source.slice(0, start)) && /^\s*\)\s*(?:=>|\{)/.test(after);
        if (isAssignment || isParameter) {
            bodies.push(source.slice(start + 1, end));
        }
    }
    return bodies;
};

// Top-level entries of a destructuring body, split on the commas that are
// not nested in (), [], {} or a string.
const splitEntries = (body) => {
    const entries = [];
    let depth = 0;
    let quote = null;
    let current = "";
    for (const char of body) {
        if (quote) {
            if (char === quote) quote = null;
        } else if ("\"'`".includes(char)) {
            quote = char;
        } else if ("([{".includes(char)) {
            depth++;
        } else if (")]}".includes(char)) {
            depth--;
        } else if (char === "," && depth === 0) {
            entries.push(current.trim());
            current = "";
            continue;
        }
        current += char;
    }
    entries.push(current.trim());
    return entries.filter(Boolean);
};

const LITERAL_ONLY = new RegExp(String.raw`^(?:${LITERAL})$`);
const ENTRY = /^([\w$]+)\s*(?::\s*[\w$]+\s*)?(?:=\s*([\s\S]+))?$/;

/**
 * What the code does when `key` is not passed, for every destructuring that
 * reads it: `{ literal: value }`, `{ expression: text }` (`goBackLimit =
 * 1/5`), or `{ none: true }` when it is read without a default, which makes
 * the default `undefined` whatever defaultProps says.
 */
export const findCodeDefaults = (source, key) => destructuringBodies(stripComments(source))
    .flatMap(splitEntries)
    .map((entry) => ENTRY.exec(entry))
    .filter((match) => match && match[1] === key)
    .map(([, , value]) => {
        if (value === undefined) return { none: true };
        const text = value.trim();
        return LITERAL_ONLY.test(text) ? { literal: parseLiteral(text) } : { expression: text };
    });

const isSimpleLiteral = (value) => ["boolean", "number", "string"].includes(typeof value);

const collectMismatches = () => {
    const mismatches = [];
    for (const [propsPath, module] of Object.entries(propsModules)) {
        if (!module.defaultProps) continue;
        const sourcePath = propsPath.replace(/props\.js$/, "index.jsx");
        const source = sources[sourcePath];
        // A component that spreads defaultProps itself applies them.
        if (!source || /\.\.\.\s*defaultProps\b/.test(source)) continue;
        const component = propsPath.split("/").slice(-2, -1)[0];

        for (const [prop, documented] of Object.entries(module.defaultProps)) {
            if (!isSimpleLiteral(documented)) continue;
            const found = findCodeDefaults(source, prop);
            const literals = new Set(found.filter((item) => "literal" in item).map((item) => item.literal));
            const hasExpression = found.some((item) => "expression" in item);

            for (const codeDefault of literals) {
                if (codeDefault !== documented) {
                    mismatches.push(`${component}.${prop}: defaultProps ${JSON.stringify(documented)}, code ${JSON.stringify(codeDefault)}`);
                }
            }
            if (found.length > 0 && literals.size === 0 && !hasExpression) {
                mismatches.push(`${component}.${prop}: defaultProps ${JSON.stringify(documented)}, code none`);
            }
        }
    }
    return mismatches.sort();
};

describe("defaultProps match the defaults written in the code", () => {
    it("finds the props.js / index.jsx pairs to compare", () => {
        const withDefaults = Object.values(propsModules).filter((module) => module.defaultProps);
        expect(withDefaults.length).toBeGreaterThan(10);
    });

    it("has no component whose defaultProps disagree with its destructuring defaults", () => {
        expect(collectMismatches()).toEqual([]);
    });
});

describe("findCodeDefaults", () => {
    it("reads defaults from function parameters", () => {
        const source = "export const Item = ({ active = false, onClick = () => {} }) => null;";
        expect(findCodeDefaults(source, "active")).toEqual([{ literal: false }]);
    });

    it("reads plain, renamed, missing and computed defaults", () => {
        const source = "const { hideOnScroll = true, size: s = \"md\", box = { width: 280, height: 1 }, zIndex = 40, mode, limit = 1/5 } = props;";
        expect(findCodeDefaults(source, "hideOnScroll")).toEqual([{ literal: true }]);
        expect(findCodeDefaults(source, "size")).toEqual([{ literal: "md" }]);
        expect(findCodeDefaults(source, "zIndex")).toEqual([{ literal: 40 }]);
        expect(findCodeDefaults(source, "mode")).toEqual([{ none: true }]);
        expect(findCodeDefaults(source, "limit")).toEqual([{ expression: "1/5" }]);
        expect(findCodeDefaults(source, "height")).toEqual([]);
    });

    it("ignores comparisons, arrows, member accesses, JSX attributes and comments", () => {
        const source = [
            "if (hideOnScroll === true) {}",
            "const f = (hideOnScroll) => hideOnScroll;",
            "props.hideOnScroll = false,",
            "// hideOnScroll = false,",
            "<div hideOnScroll=\"true\" />",
        ].join("\n");
        expect(findCodeDefaults(source, "hideOnScroll")).toEqual([]);
    });
});
