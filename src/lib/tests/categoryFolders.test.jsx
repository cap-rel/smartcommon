/**
 * Category folder coverage tests.
 *
 * Complements barrelExports.test.jsx: that test compares the public surfaces
 * of `lib/components` (dev barrel) and `lib/components/export` (build barrel)
 * to each other and to a list of critical exports. It does NOT catch a new
 * folder added under `components/<cat>/` that was forgotten in BOTH barrels
 * (the orphan-folder case).
 *
 * This file walks the filesystem under each category and asserts that every
 * subfolder is referenced from both `<cat>/index.js` and `<cat>/export.js`,
 * except when explicitly allowlisted in KNOWN_UNEXPORTED.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = join(__dirname, "..", "components");

const CATEGORIES = ["app", "form", "formats", "little", "main", "navigation", "others"];

// Folders that exist on disk but are intentionally NOT exported.
// Each entry is a "<category>/<folder>" key. Add a one-line reason next to it
// so a future cleanup can decide whether to delete the folder or wire it up.
const KNOWN_UNEXPORTED = new Set([
    // Empty - add a `<category>/<folder>` entry here with a one-line
    // reason if a folder must intentionally remain unexported.
]);

const listSubfolders = (dir) =>
    readdirSync(dir)
        .filter((name) => statSync(join(dir, name)).isDirectory())
        .sort();

// Pick the immediate subfolder name from any `from "./Name"` or
// `from "./Name/sub/path"` import. We do not care about the rest.
const collectReferencedFolders = (barrelPath) => {
    const text = readFileSync(barrelPath, "utf8");
    const re = /from\s+["']\.\/([^"'/]+)(?:\/[^"']+)?["']/g;
    const refs = new Set();
    let m;
    while ((m = re.exec(text)) !== null) refs.add(m[1]);
    return refs;
};

describe.each(CATEGORIES)("components/%s barrels", (cat) => {
    const catDir = join(COMPONENTS_DIR, cat);
    const subfolders = listSubfolders(catDir);
    const expectedExported = subfolders.filter(
        (s) => !KNOWN_UNEXPORTED.has(`${cat}/${s}`)
    );
    const indexRefs = collectReferencedFolders(join(catDir, "index.js"));
    const exportRefs = collectReferencedFolders(join(catDir, "export.js"));

    it("every subfolder is referenced in index.js", () => {
        const missing = expectedExported.filter((s) => !indexRefs.has(s));
        expect(
            missing,
            `Folders exist under components/${cat}/ but are not in index.js. ` +
                `Add them to index.js (and export.js) or to KNOWN_UNEXPORTED with a reason.`
        ).toEqual([]);
    });

    it("every subfolder is referenced in export.js", () => {
        const missing = expectedExported.filter((s) => !exportRefs.has(s));
        expect(
            missing,
            `Folders exist under components/${cat}/ but are not in export.js. ` +
                `Add them to export.js (and index.js) or to KNOWN_UNEXPORTED with a reason.`
        ).toEqual([]);
    });

    it("index.js and export.js reference the same subfolders", () => {
        const onlyInIndex = [...indexRefs].filter((s) => !exportRefs.has(s)).sort();
        const onlyInExport = [...exportRefs].filter((s) => !indexRefs.has(s)).sort();
        expect(
            { onlyInIndex, onlyInExport },
            `index.js (dev / Storybook) and export.js (npm build) reference ` +
                `different sets of folders under components/${cat}/.`
        ).toEqual({ onlyInIndex: [], onlyInExport: [] });
    });

    it("allowlisted folders still exist on disk", () => {
        const stale = [...KNOWN_UNEXPORTED]
            .filter((k) => k.startsWith(`${cat}/`))
            .map((k) => k.slice(cat.length + 1))
            .filter((s) => !subfolders.includes(s));
        expect(
            stale,
            `KNOWN_UNEXPORTED references folders that no longer exist - ` +
                `remove the dead entries.`
        ).toEqual([]);
    });

    it("allowlisted folders are not already exported", () => {
        // If a folder ends up in both KNOWN_UNEXPORTED and one of the barrels,
        // the allowlist entry is redundant and should be removed.
        const redundant = [...KNOWN_UNEXPORTED]
            .filter((k) => k.startsWith(`${cat}/`))
            .map((k) => k.slice(cat.length + 1))
            .filter((s) => indexRefs.has(s) || exportRefs.has(s));
        expect(
            redundant,
            `KNOWN_UNEXPORTED lists folders that are actually exported - ` +
                `drop them from the allowlist.`
        ).toEqual([]);
    });
});
