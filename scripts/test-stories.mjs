// Story smoke test: serve the built Storybook and render every story AND every
// autodocs page headlessly, failing if any of them crashes at render time.
//
// This catches the whole class of bugs that a unit test never sees: a story
// (or a Docs page) that throws on mount because a component is not robust to
// the props the story passes (or omits). It found, in one pass, broken stories
// for DataTable, FilesUploader, DebugConsole, Map and ProductCategoryBrowser.
//
// Usage:
//   npm run test:stories        # builds Storybook, then runs this
//   npm run test:stories:fast   # runs this against an existing storybook-static
//   node scripts/test-stories.mjs
//
// Exit code 0 = all entries rendered, 1 = at least one crashed (or no build).

import http from "node:http";
import os from "node:os";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync, statSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STATIC_DIR = path.join(ROOT, "storybook-static");
const INDEX_JSON = path.join(STATIC_DIR, "index.json");

// Tunables (env-overridable). Concurrency defaults to a safe slice of the CPUs.
const CONCURRENCY = Number(process.env.SMARTCOMMON_STORIES_CONCURRENCY)
  || Math.max(2, Math.min(6, (os.cpus()?.length || 4) - 2));
const PER_PAGE_WAIT_MS = Number(process.env.SMARTCOMMON_STORIES_WAIT_MS) || 1000;
const NAV_TIMEOUT_MS = 25000;

// Render-crash signatures. We deliberately ignore benign console.error noise
// (e.g. "useApi() called outside provider") and only flag real render failures.
const CRASH_RE =
  /is not a function|Cannot read propert|Cannot access|Maximum update depth|Rendered (more|fewer) hooks|Objects are not valid as a React child|(undefined|null) is not an object|Element type is invalid/i;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf",
  ".mp4": "video/mp4", ".map": "application/json", ".txt": "text/plain",
};

// Resolve a usable Chromium binary. Playwright's default path can point at a
// browser build that is not actually installed when several Playwright versions
// share the same machine; fall back to scanning the install cache.
const resolveChromium = () => {
  try {
    const p = chromium.executablePath();
    if (p && existsSync(p)) return p;
  } catch { /* no default install */ }
  const cache = path.join(os.homedir(), ".cache", "ms-playwright");
  if (!existsSync(cache)) return undefined;
  const candidates = [];
  for (const dir of readdirSync(cache)) {
    for (const rel of [
      ["chrome-headless-shell-linux64", "chrome-headless-shell"],
      ["chrome-linux64", "chrome"],
      ["chrome-linux", "chrome"],
    ]) {
      const bin = path.join(cache, dir, ...rel);
      if (existsSync(bin)) candidates.push({ dir, bin });
    }
  }
  if (!candidates.length) return undefined;
  // Prefer the highest-numbered build (dir names like chromium_headless_shell-1228).
  candidates.sort((a, b) => a.dir.localeCompare(b.dir, undefined, { numeric: true }));
  return candidates[candidates.length - 1].bin;
};

const startServer = () =>
  new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        let p = decodeURIComponent(req.url.split("?")[0]);
        if (p === "/") p = "/index.html";
        let fp = path.join(STATIC_DIR, p);
        if (existsSync(fp) && statSync(fp).isDirectory()) fp = path.join(fp, "index.html");
        if (!existsSync(fp)) { res.writeHead(404); res.end("404"); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream" });
        res.end(await readFile(fp));
      } catch (e) { res.writeHead(500); res.end(String(e)); }
    });
    // Port 0 -> OS picks a free port; no hardcoding, no cross-project collision.
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

const main = async () => {
  if (!existsSync(INDEX_JSON)) {
    console.error(
      `[test-stories] No build found at ${STATIC_DIR}.\n` +
      `[test-stories] Run "npm run build-storybook" first, or use "npm run test:stories".`
    );
    process.exit(1);
  }

  const index = JSON.parse(await readFile(INDEX_JSON, "utf8"));
  const entries = Object.values(index.entries || {});
  const stories = entries.filter((e) => e.type === "story").length;
  const docs = entries.filter((e) => e.type === "docs").length;
  console.log(`[test-stories] ${entries.length} entries (story=${stories}, docs=${docs}), concurrency=${CONCURRENCY}`);

  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ executablePath: resolveChromium() });
  const ctx = await browser.newContext();
  const broken = [];

  const check = async (entry) => {
    const page = await ctx.newPage();
    const hits = [];
    page.on("pageerror", (e) => {
      const m = String(e?.message || e);
      if (CRASH_RE.test(m)) hits.push(m.split("\n")[0]);
    });
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const t = msg.text();
      if (CRASH_RE.test(t)) hits.push(t.split("\n")[0]);
    });
    const viewMode = entry.type === "docs" ? "docs" : "story";
    const url = `http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=${viewMode}`;
    try {
      await page.goto(url, { waitUntil: "load", timeout: NAV_TIMEOUT_MS });
      await page.waitForTimeout(PER_PAGE_WAIT_MS);
      const overlay = await page.evaluate(() =>
        document.body.classList.contains("sb-show-errordisplay")
          ? (document.querySelector("#error-message")?.textContent || "render error")
              .trim().split("\n")[0].slice(0, 160)
          : null
      );
      if (hits.length || overlay) {
        broken.push({ ...entry, err: overlay || hits[0] });
      }
    } catch (e) {
      broken.push({ ...entry, err: `NAV: ${String(e.message).slice(0, 120)}` });
    } finally {
      await page.close();
    }
  };

  let cursor = 0;
  const worker = async () => {
    while (cursor < entries.length) {
      const e = entries[cursor++];
      await check(e);
      if (cursor % 40 === 0) console.log(`[test-stories]   ...${cursor}/${entries.length}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await browser.close();
  server.close();

  if (broken.length) {
    console.error(`\n[test-stories] FAILED - ${broken.length}/${entries.length} entries crashed:\n`);
    for (const b of broken.sort((a, b) => (a.title || "").localeCompare(b.title || ""))) {
      console.error(`  x [${b.type}] ${b.title} :: ${b.name}`);
      console.error(`      id:  ${b.id}`);
      console.error(`      err: ${b.err}`);
    }
    process.exit(1);
  }

  console.log(`\n[test-stories] OK - all ${entries.length} entries rendered without crashing.`);
  process.exit(0);
};

main().catch((e) => {
  console.error("[test-stories] runner error:", e);
  process.exit(1);
});
