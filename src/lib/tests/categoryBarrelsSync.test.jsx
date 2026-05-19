/**
 * Per-category barrel symmetry tests.
 *
 * Each component category exposes TWO barrels:
 *   - <cat>/index.js   -> dev / Storybook surface
 *   - <cat>/export.js  -> library build surface (re-exported by
 *                         lib/export.js into the npm package)
 *
 * Both barrels MUST list the same `export * from "./<X>"` entries.
 * Forgetting to update one of them is the historical source of bugs
 * like the old `others/Modal` divergence (present in dev, missing
 * from the published npm package).
 *
 * The existing test src/lib/tests/barrelExports.test.jsx covers the
 * top-level lib/components barrels. This file extends the coverage
 * to every per-category barrel, plus checks that every component
 * folder is exported by both barrels (no orphan dirs that were added
 * but never wired in).
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const CATEGORIES = [
    "app",
    "form",
    "formats",
    "little",
    "main",
    "navigation",
    "others",
];

const COMPONENTS_ROOT = resolve(process.cwd(), "src/lib/components");

// Parse `export * from "./<X>";` and `export * from "./<X>/<Y>";`
// from a barrel file, return the sorted list of subpaths exported.
const parseBarrelSubpaths = (filePath) => {
    const source = readFileSync(filePath, "utf8");
    const subpaths = [];
    // Match `export ... from "./..."` (any export form).
    const re = /export\s+\*?\s*(?:\{[^}]*\}\s*)?from\s+["']\.\/([^"']+)["']/g;
    let m;
    while ((m = re.exec(source)) !== null) {
        subpaths.push(m[1]);
    }
    return subpaths.sort();
};

// List immediate subfolders of a category dir that look like a
// component (contain an index.jsx). Excludes special folders that
// are intentionally NOT exported (tools, pages, variants, stories).
const COMPONENT_FOLDER_BLACKLIST = new Set([
    "pages",
    "stories",
    "variants",
    "tests",
]);

const listComponentFolders = (categoryDir) => {
    const entries = readdirSync(categoryDir);
    return entries
        .filter((name) => {
            const fullPath = join(categoryDir, name);
            if (!statSync(fullPath).isDirectory()) return false;
            if (COMPONENT_FOLDER_BLACKLIST.has(name)) return false;
            return existsSync(join(fullPath, "index.jsx"));
        })
        .sort();
};

describe("per-category barrels: dev <-> build symmetry", () => {
    CATEGORIES.forEach((category) => {
        const categoryDir = join(COMPONENTS_ROOT, category);
        const indexPath = join(categoryDir, "index.js");
        const exportPath = join(categoryDir, "export.js");

        it(`${category}/: index.js and export.js list the same subpaths`, () => {
            expect(
                existsSync(indexPath),
                `Missing ${indexPath}`
            ).toBe(true);
            expect(
                existsSync(exportPath),
                `Missing ${exportPath}`
            ).toBe(true);

            const dev = parseBarrelSubpaths(indexPath);
            const build = parseBarrelSubpaths(exportPath);

            const onlyInDev = dev.filter((s) => !build.includes(s));
            const onlyInBuild = build.filter((s) => !dev.includes(s));

            expect(
                { onlyInDev, onlyInBuild },
                `Barrels out of sync in lib/components/${category}/. ` +
                    `Update both index.js and export.js so they re-export ` +
                    `the same set of subpaths.`
            ).toEqual({ onlyInDev: [], onlyInBuild: [] });
        });

        it(`${category}/: every component folder is wired into the barrels`, () => {
            const folders = listComponentFolders(categoryDir);
            const indexSubpaths = parseBarrelSubpaths(indexPath);

            // A folder is "wired" if EITHER a top-level subpath matches
            // its name (export * from "./<X>") OR a nested subpath
            // starts with "<X>/" (export * from "./<X>/context").
            const isWired = (folder) =>
                indexSubpaths.some(
                    (s) => s === folder || s.startsWith(`${folder}/`)
                );

            const orphans = folders.filter((f) => !isWired(f));

            expect(
                orphans,
                `Found component folders in lib/components/${category}/ ` +
                    `that are not re-exported by index.js. They will be ` +
                    `invisible to consumers. Either add the export or ` +
                    `delete the folder.`
            ).toEqual([]);
        });
    });
});
