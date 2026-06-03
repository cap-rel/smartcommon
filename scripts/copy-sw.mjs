// Post-build step: ship the Service Worker push helper in dist/.
//
// registerPushHandlers.js is pure, dependency-free ESM consumed by each
// project's Service Worker build (vite-plugin-pwa injectManifest), NOT by the
// React app bundle. It must therefore stay OUT of dist/smartcommon.es.js. But
// the published package excludes src/ (.npmignore), so we copy the standalone
// file verbatim into dist/ where the "./sw" export points and where the tarball
// actually ships it.

import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "lib", "sw", "registerPushHandlers.js");
const dest = join(root, "dist", "sw.js");

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);

// eslint-disable-next-line no-console
console.log("[copy-sw] dist/sw.js written from src/lib/sw/registerPushHandlers.js");
