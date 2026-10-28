import { describe, it, expect, beforeEach, vi } from "vitest";

import { buildContext, buildFormData, stripQuery, IDENTITY_KEYS, prepareScreenshot } from "./feedbackPayload";
import { setLogBufferEnabled, setNetworkErrorBufferEnabled } from "lib/utils";

// Mock the image pipeline: the real one needs canvas/createImageBitmap
// which are not available in the Node test environment.
vi.mock("lib/upload", () => ({
    convertImageForUpload: vi.fn(async (file) => ({ file, width: 100, height: 100, mime: file.type })),
}));

// Helper: read all keys from a FormData as an array.
const formDataKeys = (formData) => {
    const keys = [];
    for (const key of formData.keys()) {
        keys.push(key);
    }
    return keys;
};

// Helper: read all entries from a FormData as a plain object (last wins
// for duplicate keys, which is fine for our assertions).
const formDataToObject = (formData) => {
    const obj = {};
    for (const [key, value] of formData.entries()) {
        obj[key] = value;
    }
    return obj;
};

describe("stripQuery", () => {
    it("removes the query string", () => {
        expect(stripQuery("https://app.example.com/page?token=abc&foo=bar"))
            .toBe("https://app.example.com/page");
    });

    it("leaves URLs without query string untouched", () => {
        expect(stripQuery("https://app.example.com/page"))
            .toBe("https://app.example.com/page");
    });
});

describe("buildContext", () => {
    it("sets channel to pwa", () => {
        const ctx = buildContext("1.0.0", "https://app.example.com/home");
        expect(ctx.channel).toBe("pwa");
    });

    it("strips the query string from page_url", () => {
        const ctx = buildContext("1.0.0", "https://app.example.com/home?dolapikey=secret&token=abc");
        expect(ctx.page_url).toBe("https://app.example.com/home");
        expect(ctx.page_url).not.toContain("dolapikey");
        expect(ctx.page_url).not.toContain("secret");
    });

    it("extracts the route from page_url", () => {
        const ctx = buildContext("1.0.0", "https://app.example.com/some/route?x=1");
        expect(ctx.route).toBe("/some/route");
    });

    it("includes app_version when provided", () => {
        const ctx = buildContext("2.3.4", "https://app.example.com/");
        expect(ctx.app_version).toBe("2.3.4");
    });

    it("omits app_version when empty", () => {
        const ctx = buildContext("", "https://app.example.com/");
        expect(ctx.app_version).toBeUndefined();
    });

    it("includes occurred_at as ISO 8601", () => {
        const ctx = buildContext("1.0.0", "https://app.example.com/");
        expect(ctx.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("includes log_excerpt and network_errors arrays", () => {
        const ctx = buildContext("1.0.0", "https://app.example.com/");
        expect(Array.isArray(ctx.log_excerpt)).toBe(true);
        expect(Array.isArray(ctx.network_errors)).toBe(true);
    });

    it("never sets identity fields", () => {
        const ctx = buildContext("1.0.0", "https://app.example.com/");
        expect(ctx).not.toHaveProperty("reporter");
        expect(ctx).not.toHaveProperty("rights");
        expect(ctx).not.toHaveProperty("installed_version");
    });
});

describe("buildFormData", () => {
    beforeEach(() => {
        // Reset buffers so tests are deterministic.
        setLogBufferEnabled(false);
        setLogBufferEnabled(true);
        setNetworkErrorBufferEnabled(false);
        setNetworkErrorBufferEnabled(true);
    });

    it("appends type and body", () => {
        const fd = buildFormData({
            type: "bug",
            body: "Something is broken",
            locationHref: "https://app.example.com/page",
        });
        const obj = formDataToObject(fd);
        expect(obj.type).toBe("bug");
        expect(obj.body).toBe("Something is broken");
    });

    it("appends title only when non-empty", () => {
        const withTitle = buildFormData({
            type: "idea",
            title: "A title",
            body: "Body",
            locationHref: "https://app.example.com/",
        });
        expect(formDataToObject(withTitle).title).toBe("A title");

        const withoutTitle = buildFormData({
            type: "idea",
            title: "",
            body: "Body",
            locationHref: "https://app.example.com/",
        });
        expect(formDataToObject(withoutTitle).title).toBeUndefined();
    });

    it("flattens context into bracket-notation fields", () => {
        const fd = buildFormData({
            type: "bug",
            body: "Test",
            appVersion: "1.2.3",
            locationHref: "https://app.example.com/dashboard?token=secret",
        });
        const obj = formDataToObject(fd);

        expect(obj["context[channel]"]).toBe("pwa");
        expect(obj["context[app_version]"]).toBe("1.2.3");
        expect(obj["context[page_url]"]).toBe("https://app.example.com/dashboard");
        expect(obj["context[route]"]).toBe("/dashboard");
        expect(obj["context[occurred_at]"]).toBeTruthy();
    });

    it("strips query string from context page_url", () => {
        const fd = buildFormData({
            type: "bug",
            body: "Test",
            locationHref: "https://app.example.com/x?dolapikey=abc123",
        });
        const obj = formDataToObject(fd);
        expect(obj["context[page_url]"]).toBe("https://app.example.com/x");
        expect(obj["context[page_url]"]).not.toContain("dolapikey");
    });

    it("appends screenshot and consent when an image is attached", () => {
        const file = new File(["fake-image-bytes"], "screenshot.png", { type: "image/png" });
        const fd = buildFormData({
            type: "bug",
            body: "See screenshot",
            screenshot: file,
            consent: true,
            locationHref: "https://app.example.com/",
        });
        const obj = formDataToObject(fd);

        expect(obj.screenshot).toBeInstanceOf(File);
        expect(obj.screenshot_consent).toBe("1");
    });

    it("appends consent as 0 when screenshot present but consent false", () => {
        const file = new File(["fake"], "s.jpg", { type: "image/jpeg" });
        const fd = buildFormData({
            type: "bug",
            body: "Test",
            screenshot: file,
            consent: false,
            locationHref: "https://app.example.com/",
        });
        expect(formDataToObject(fd).screenshot_consent).toBe("0");
    });

    it("omits screenshot fields when no image is attached", () => {
        const fd = buildFormData({
            type: "bug",
            body: "No image",
            locationHref: "https://app.example.com/",
        });
        const keys = formDataKeys(fd);
        expect(keys).not.toContain("screenshot");
        expect(keys).not.toContain("screenshot_consent");
    });

    it("never includes identity fields", () => {
        const file = new File(["fake"], "s.jpg", { type: "image/jpeg" });
        const fd = buildFormData({
            type: "bug",
            title: "T",
            body: "B",
            screenshot: file,
            consent: true,
            appVersion: "1.0.0",
            locationHref: "https://app.example.com/",
        });
        const keys = formDataKeys(fd);

        for (const identityKey of IDENTITY_KEYS) {
            expect(keys, `must not contain identity key "${identityKey}"`).not.toContain(identityKey);
        }

        // Also check no key starts with "reporter" or "context[rights"
        const suspicious = keys.filter(k =>
            k.startsWith("reporter") ||
            k.startsWith("context[rights") ||
            k === "installed_version"
        );
        expect(suspicious).toEqual([]);
    });

    it("appends log_excerpt entries as indexed fields", () => {
        // The log buffer is populated by createLogger; we just verify the
        // flattening shape when entries exist.
        const fd = buildFormData({
            type: "bug",
            body: "Test",
            locationHref: "https://app.example.com/",
        });
        const keys = formDataKeys(fd);
        // log_excerpt keys follow the pattern context[log_excerpt][N]
        const logKeys = keys.filter(k => k.startsWith("context[log_excerpt]["));
        for (const k of logKeys) {
            expect(k).toMatch(/^context\[log_excerpt\]\[\d+\]$/);
        }
    });

    it("reuses a provided context instead of rebuilding it", () => {
        // A report queued offline carries the context captured at submit
        // time: the flush must describe the moment of the problem.
        const fixedContext = {
            channel: "pwa",
            app_version: "9.9.9",
            page_url: "https://app.example.com/problem",
            route: "/problem",
            viewport: "390x844",
            locale: "fr-FR",
            occurred_at: "2020-01-01T00:00:00.000Z",
            log_excerpt: ["2020-01-01T00:00:00.000Z ERROR [x] boom"],
            network_errors: [
                { method: "GET", url: "https://api.example.com/x", status: 500, at: "2020-01-01T00:00:00.000Z" },
            ],
        };
        const fd = buildFormData({
            type: "bug",
            body: "Queued while offline",
            context: fixedContext,
        });
        const obj = formDataToObject(fd);

        expect(obj["context[occurred_at]"]).toBe("2020-01-01T00:00:00.000Z");
        expect(obj["context[page_url]"]).toBe("https://app.example.com/problem");
        expect(obj["context[log_excerpt][0]"]).toBe("2020-01-01T00:00:00.000Z ERROR [x] boom");
        expect(obj["context[network_errors][0][method]"]).toBe("GET");
        expect(obj["context[network_errors][0][status]"]).toBe("500");
    });

    it("appends network_errors entries with method, url, status, at", () => {
        const fd = buildFormData({
            type: "bug",
            body: "Test",
            locationHref: "https://app.example.com/",
        });
        const keys = formDataKeys(fd);
        const netKeys = keys.filter(k => k.startsWith("context[network_errors]["));
        for (const k of netKeys) {
            expect(k).toMatch(/^context\[network_errors\]\[\d+\]\[(method|url|status|at)\]$/);
        }
    });
});

describe("prepareScreenshot", () => {
    it("returns the file from convertImageForUpload", async () => {
        const { convertImageForUpload } = await import("lib/upload");
        const original = new File(["data"], "photo.jpg", { type: "image/jpeg" });
        const converted = new File(["smaller"], "photo.jpg", { type: "image/webp" });
        convertImageForUpload.mockResolvedValueOnce({ file: converted, width: 1920, height: 1080, mime: "image/webp" });

        const result = await prepareScreenshot(original);
        expect(result).toBe(converted);
        expect(convertImageForUpload).toHaveBeenCalledWith(original, expect.objectContaining({
            maxSide: 1920,
            maxBytes: 5120 * 1024,
            targetBytes: 2 * 1024 * 1024,
        }));
    });

    it("falls back to the original file when conversion fails", async () => {
        const { convertImageForUpload } = await import("lib/upload");
        const original = new File(["data"], "photo.jpg", { type: "image/jpeg" });
        convertImageForUpload.mockRejectedValueOnce(new Error("decode failed"));

        const result = await prepareScreenshot(original);
        expect(result).toBe(original);
    });
});
