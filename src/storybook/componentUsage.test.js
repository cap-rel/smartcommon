// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../scripts/component-usage.mjs");

const write = async (file, content) => {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, content, "utf8");
};

describe("scripts/component-usage.mjs", () => {
    let root;
    let result;

    beforeAll(async () => {
        root = await mkdtemp(path.join(tmpdir(), "sc-usage-"));

        // Two files importing Button, one of them also Input under an alias.
        await write(path.join(root, "alpha/mobile/src/A.jsx"),
            'import { Button, Input as TextInput } from "@cap-rel/smartcommon";\n');
        await write(path.join(root, "alpha/mobile/src/B.jsx"),
            'import {\n    Button,\n    Page,\n} from "@cap-rel/smartcommon";\n');
        // A build output and dependencies must not count.
        await write(path.join(root, "alpha/mobile/node_modules/x/index.js"),
            'import { Button } from "@cap-rel/smartcommon";\n');
        await write(path.join(root, "alpha/mobile/pwa/assets/index.js"),
            'import { Button } from "@cap-rel/smartcommon";\n');

        await write(path.join(root, "beta/src/C.js"),
            "import { Button } from '@cap-rel/smartcommon';\n");
        // A project that does not use smartcommon is not listed.
        await write(path.join(root, "gamma/src/D.js"), 'import { useState } from "react";\n');
        // A backup copy and a symlink alias are skipped.
        await write(path.join(root, "alpha.save/src/E.jsx"),
            'import { Tabbar } from "@cap-rel/smartcommon";\n');
        await symlink(path.join(root, "alpha"), path.join(root, "aaa-alias"));

        const out = path.join(root, "usage.json");
        await run(process.execPath, [script, "--root", root, "--out", out]);
        result = JSON.parse(await readFile(out, "utf8"));
    }, 30000);

    afterAll(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it("lists only the projects importing smartcommon, under their own name", () => {
        expect(result.projects).toEqual(["alpha", "beta"]);
    });

    it("counts the files importing each name, most used project first", () => {
        expect(result.components.Button).toEqual({ alpha: 2, beta: 1 });
        expect(result.components.Page).toEqual({ alpha: 1 });
    });

    it("records an aliased import under the exported name", () => {
        expect(result.components.Input).toEqual({ alpha: 1 });
        expect(result.components.TextInput).toBeUndefined();
    });

    it("ignores backup copies, dependencies and build output", () => {
        expect(result.components.Tabbar).toBeUndefined();
        expect(result.components.Button.alpha).toBe(2);
    });

    it("stamps the scan date", () => {
        expect(result.scannedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("fails with a message when the root does not exist", async () => {
        await expect(run(process.execPath, [script, "--root", path.join(root, "missing"), "--out", path.join(root, "x.json")]))
            .rejects.toMatchObject({ stderr: expect.stringContaining("cannot be read") });
    });
});
