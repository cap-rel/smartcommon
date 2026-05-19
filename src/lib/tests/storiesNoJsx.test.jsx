/**
 * `.stories.js` MUST NOT contain JSX.
 *
 * Storybook's `inject-export-order-plugin` parses every `.stories.js`
 * file as plain JavaScript (no JSX transform), so a JSX node inside
 * one of them crashes the Storybook build with a misleading parser
 * error far from the actual file.
 *
 * Workaround in our codebase: JSX decorators / story bodies live in
 * sibling `.jsx` files (e.g. `decorators.jsx`, `stories/index.jsx`),
 * and the `.stories.js` imports them as plain values.
 *
 * This test parses every `.stories.js` under src/lib/ with a JSX-
 * aware parser. If the parser finds any JSX node, the test fails
 * with a pointer to the offending file.
 *
 * (We use acorn with acorn-jsx via Vite's bundled dependency, which
 * is already on disk. No new package needed.)
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import { Parser } from "acorn";
import jsx from "acorn-jsx";

const JsxParser = Parser.extend(jsx());

const walkForStories = (dir, acc) => {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            if (name === "node_modules") continue;
            walkForStories(full, acc);
        } else if (name.endsWith(".stories.js")) {
            acc.push(full);
        }
    }
    return acc;
};

const collectStoriesFiles = () => {
    const root = resolve(process.cwd(), "src/lib");
    return walkForStories(root, [])
        .map((p) => relative(process.cwd(), p))
        .sort();
};

const findJsxNodes = (ast) => {
    const offenders = [];
    const walk = (node) => {
        if (!node || typeof node !== "object") return;
        if (
            node.type === "JSXElement" ||
            node.type === "JSXFragment"
        ) {
            offenders.push(node);
            return; // no need to descend further into this subtree
        }
        for (const key of Object.keys(node)) {
            if (key === "parent" || key === "loc" || key === "range") continue;
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(walk);
            } else if (child && typeof child === "object" && child.type) {
                walk(child);
            }
        }
    };
    walk(ast);
    return offenders;
};

describe("Storybook story files: no JSX in .stories.js", () => {
    it("every .stories.js parses with no JSX node at the top level", () => {
        const files = collectStoriesFiles();
        // Anchor against accidental loss of the glob result.
        expect(files.length, "No .stories.js files found").toBeGreaterThan(0);

        const violations = [];
        for (const relPath of files) {
            const absPath = resolve(process.cwd(), relPath);
            const source = readFileSync(absPath, "utf8");
            let ast;
            try {
                ast = JsxParser.parse(source, {
                    ecmaVersion: "latest",
                    sourceType: "module",
                    locations: true,
                });
            } catch (err) {
                // A parse error here is also a regression: the file is
                // unloadable by Storybook. Surface it as a violation.
                violations.push({
                    file: relPath,
                    reason: `parse error: ${err.message}`,
                });
                continue;
            }
            const jsxNodes = findJsxNodes(ast);
            if (jsxNodes.length > 0) {
                violations.push({
                    file: relPath,
                    reason: `${jsxNodes.length} JSX node(s) at line(s) ` +
                        jsxNodes.map((n) => n.loc?.start?.line).join(", "),
                });
            }
        }

        expect(
            violations,
            ".stories.js cannot contain JSX (Storybook's " +
                "inject-export-order-plugin parses it as plain JS). " +
                "Move JSX into a sibling .jsx file and import it as a " +
                "value."
        ).toEqual([]);
    });
});
