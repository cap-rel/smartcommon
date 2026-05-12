import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

// What this test guards
// ---------------------
// smartcommon is a library: every peerDependency that ships React Context or
// stateful singletons MUST be marked as external in vite.config.js. Otherwise
// the published bundle ends up with its own copy of the peer, the consumer
// has another copy in its own node_modules, and two React Context objects
// coexist. That dual-bundle situation is exactly what caused <RouteGuard>'s
// <Outlet /> to silently render null when capTodo nested its own
// <BrowserRouter>. We fixed react-router/react-router-dom; this test prevents
// the same regression for the other peers.
//
// The check is source-truth driven: for each runtime peer
//   1. Find every `from "peer"` (or `from "peer/subpath"`) inside src/lib/.
//   2. Assert that at least one matching `from "peer"` survives in dist/.
//      If the source imports it but the bundle does not, rollup inlined the
//      peer, which is the regression we are looking for.

const REPO_ROOT = resolve(__dirname, "../../..");
const DIST_DIR = resolve(REPO_ROOT, "dist");
const SRC_DIR = resolve(REPO_ROOT, "src/lib");
const PACKAGE_JSON = resolve(REPO_ROOT, "package.json");

// Peers that are build-time only (Vite plugins, Tailwind compiler, PWA
// service worker generator). They are never imported at runtime so the
// bundle never references them.
const BUILD_ONLY_PEERS = new Set([
    "@tailwindcss/vite",
    "tailwindcss",
    "vite-plugin-pwa",
]);

const collectJsFiles = (dir) => {
    const out = [];
    const walk = (current) => {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            const full = join(current, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === "node_modules" || entry.name === "dist") continue;
                walk(full);
            } else if (
                entry.isFile() &&
                /\.(js|jsx|mjs|cjs)$/.test(entry.name) &&
                !entry.name.endsWith(".map") &&
                !entry.name.endsWith(".test.js") &&
                !entry.name.endsWith(".test.jsx")
            ) {
                out.push(full);
            }
        }
    };
    walk(dir);
    return out;
};

const importsPeerInFile = (fileText, peer) => {
    // Match: from "peer", from 'peer', from "peer/subpath".
    // Use a fresh RegExp per call so escaped characters work for scoped names.
    const escaped = peer.replace(/[/\\^$+?.()|[\]{}]/g, "\\$&");
    const re = new RegExp(`from\\s+["']${escaped}(?:/[^"']*)?["']`);
    return re.test(fileText);
};

const peerDeps = JSON.parse(readFileSync(PACKAGE_JSON, "utf8")).peerDependencies;

describe("Bundle externals: peerDependencies must not be bundled", () => {
    const hasDist = existsSync(DIST_DIR) && statSync(DIST_DIR).isDirectory();
    const distFiles = hasDist
        ? readdirSync(DIST_DIR)
              .filter((f) => /\.js$/.test(f) && !f.endsWith(".map"))
              .map((f) => join(DIST_DIR, f))
        : [];
    const distBlob = distFiles.map((f) => readFileSync(f, "utf8")).join("\n");

    const srcFiles = collectJsFiles(SRC_DIR);
    const sourcesByPeer = {};
    for (const peer of Object.keys(peerDeps)) {
        if (BUILD_ONLY_PEERS.has(peer)) continue;
        sourcesByPeer[peer] = srcFiles.some((f) => {
            const text = readFileSync(f, "utf8");
            return importsPeerInFile(text, peer);
        });
    }

    it.skipIf(!hasDist)("dist/ exists (run `npm run build` first if this is skipped)", () => {
        expect(hasDist).toBe(true);
    });

    for (const [peer] of Object.entries(peerDeps)) {
        if (BUILD_ONLY_PEERS.has(peer)) continue;

        it.skipIf(!hasDist)(`peer "${peer}" stays external in dist/`, () => {
            const usedInSource = sourcesByPeer[peer];
            if (!usedInSource) {
                // Peer declared but never imported by smartcommon source -- no
                // bundle footprint expected, nothing to check.
                return;
            }
            const externalInDist = importsPeerInFile(distBlob, peer);
            expect(
                externalInDist,
                `Peer "${peer}" is imported by src/lib/ but no \`from "${peer}"\` survives in dist/*.js. ` +
                    `That means rollup inlined the peer. Add "${peer}" to rollupOptions.external ` +
                    `in vite.config.js to avoid the dual-bundle React Context bug.`
            ).toBe(true);
        });
    }
});
