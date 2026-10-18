// `${cond && "classes"}` inside a template literal stringifies the falsy
// branch, so the DOM receives a literal "false" / "undefined" / "0" class.
// Use `${cond ? "classes" : ""}` instead. This scan keeps the pattern out of
// the library sources (comment lines are ignored).

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "src/lib");

const PATTERNS = [
    // ${cond && "x"}, ${cond && 'x'}, ${cond && `x`} on a single line
    /\$\{[^{}]*&&\s*["'`]/,
    // ${cond && `   (multi-line template opened at end of line)
    /\$\{[^{}]*&&\s*`\s*$/,
];

const listSources = (dir) => readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
        return entry === "node_modules" ? [] : listSources(path);
    }
    return /\.(jsx?|tsx?)$/.test(entry) && !/\.test\./.test(entry) ? [path] : [];
});

describe("no falsy class interpolation", () => {
    it("has no ${cond && ...} inside template literals", () => {
        const offenders = listSources(ROOT).flatMap((file) =>
            readFileSync(file, "utf8").split("\n")
                .map((line, index) => ({ line, number: index + 1 }))
                .filter(({ line }) => !/^\s*(\/\/|\*|\{\/\*)/.test(line))
                .filter(({ line }) => PATTERNS.some((pattern) => pattern.test(line)))
                .map(({ line, number }) => `${file.slice(ROOT.length + 1)}:${number}: ${line.trim()}`)
        );

        expect(offenders, `Use \${cond ? "x" : ""}:\n${offenders.join("\n")}`).toEqual([]);
    });
});
