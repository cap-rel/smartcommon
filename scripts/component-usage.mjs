#!/usr/bin/env node
// Scan the projects that consume smartcommon and record, for every name they
// import from "@cap-rel/smartcommon", how many of their files import it.
// The result (src/storybook/usage.json) feeds the "Used in" section of the
// component pages of the published Storybook.
//
// Usage: node scripts/component-usage.mjs [--root <dir>] [--out <file>]
//   --root  directory holding the consumer projects, one per sub-directory
//           (default: the parent directory of this repository)
//   --out   JSON file to write (default: src/storybook/usage.json)
//
// A project is a direct sub-directory of the root. Skipped: this repository,
// a symlink to a project already scanned, and backup copies (*.save, *.bak,
// *.old, *.orig). A project that imports nothing from smartcommon is not
// listed.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdir, readFile, realpath, writeFile, stat } from "node:fs/promises";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const SKIPPED_DIRECTORIES = new Set([
    "node_modules", "dist", "pwa", "build", "vendor", "coverage",
    "storybook-static", ".git", ".cache",
]);
const BACKUP_SUFFIX = /\.(save|bak|old|orig)$/i;
const IMPORT_PATTERN = /import\s*\{([^}]*)\}\s*from\s*["']@cap-rel\/smartcommon["']/g;

const log = (...args) => console.log("[component-usage]", ...args);
const fail = (...args) => {
    console.error("[component-usage] ERROR", ...args);
    process.exit(1);
};

const parseArgs = (argv) => {
    const args = {
        root: path.dirname(repoRoot),
        out: path.join(repoRoot, "src", "storybook", "usage.json"),
    };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--root") {
            args.root = path.resolve(argv[++i] ?? "");
        } else if (argv[i] === "--out") {
            args.out = path.resolve(argv[++i] ?? "");
        } else {
            fail(`unknown argument "${argv[i]}"`);
        }
    }
    return args;
};

// Names imported from smartcommon by one source file ("A as B" counts as A).
const importedNames = (source) => {
    const names = new Set();
    for (const match of source.matchAll(IMPORT_PATTERN)) {
        for (const part of match[1].split(",")) {
            const name = part.trim().split(/\s+as\s+/)[0].trim();
            if (name) names.add(name);
        }
    }
    return names;
};

const walk = async function* (directory) {
    let entries;
    try {
        entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
        log(`skipped unreadable directory ${directory}: ${error.code ?? error.message}`);
        return;
    }
    for (const entry of entries) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (!SKIPPED_DIRECTORIES.has(entry.name)) yield* walk(full);
        } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
            yield full;
        }
    }
};

const scanProject = async (directory) => {
    // name -> number of files importing it
    const counts = new Map();
    for await (const file of walk(directory)) {
        let source;
        try {
            source = await readFile(file, "utf8");
        } catch (error) {
            log(`skipped unreadable file ${file}: ${error.code ?? error.message}`);
            continue;
        }
        for (const name of importedNames(source)) {
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }
    }
    return counts;
};

const main = async () => {
    const { root, out: output } = parseArgs(process.argv.slice(2));

    try {
        if (!(await stat(root)).isDirectory()) fail(`--root ${root} is not a directory`);
    } catch (error) {
        fail(`--root ${root} cannot be read: ${error.code ?? error.message}`);
    }

    const ownRealPath = await realpath(repoRoot);
    const seen = new Set([ownRealPath]);
    // component -> { project -> files }
    const components = {};
    const projects = [];

    // Real directories first, symlinks after: a link to a project (often a
    // lowercase alias) must not take the place of the project's own name.
    const entries = (await readdir(root, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
        .sort((a, b) => (a.isSymbolicLink() - b.isSymbolicLink()) || a.name.localeCompare(b.name))
        .map((entry) => entry.name);

    for (const name of entries) {
        if (BACKUP_SUFFIX.test(name)) {
            log(`skipped backup copy ${name}`);
            continue;
        }
        let real;
        try {
            real = await realpath(path.join(root, name));
            if (!(await stat(real)).isDirectory()) continue;
        } catch (error) {
            log(`skipped ${name}: ${error.code ?? error.message}`);
            continue;
        }
        if (seen.has(real)) {
            if (real !== ownRealPath) log(`skipped ${name}: same directory as a project already scanned`);
            continue;
        }
        seen.add(real);

        const counts = await scanProject(real);
        if (counts.size === 0) continue;

        projects.push(name);
        for (const [component, files] of counts) {
            (components[component] ??= {})[name] = files;
        }
    }

    const sorted = Object.fromEntries(
        Object.keys(components).sort((a, b) => a.localeCompare(b)).map((component) => [
            component,
            Object.fromEntries(
                Object.entries(components[component]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            ),
        ])
    );

    const result = {
        scannedAt: new Date().toISOString().slice(0, 10),
        projects,
        components: sorted,
    };

    await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    log(`${projects.length} projects, ${Object.keys(sorted).length} imported names -> ${path.relative(repoRoot, output)}`);
};

main().catch((error) => fail(error?.stack ?? error));
