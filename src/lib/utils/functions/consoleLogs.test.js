import { describe, it, expect, beforeEach } from "vitest";

import {
    createLogger,
    getRecentLogs,
    filterSecrets,
    setLogBufferEnabled,
} from "./consoleLogs";

describe("filterSecrets", () => {
    it("masks Bearer tokens", () => {
        expect(filterSecrets("using Bearer abc.def.ghi token")).toBe("using [filtre] token");
    });

    it("masks Authorization header lines", () => {
        expect(filterSecrets("Authorization: Basic dXNlcjpwYXNz")).toBe("[filtre]");
    });

    it("masks JWTs", () => {
        const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.abc123signature";
        expect(filterSecrets(`token is ${jwt} here`)).toBe("token is [filtre] here");
    });

    it("masks password-like key=value pairs, case-insensitive", () => {
        expect(filterSecrets("password=hunter2")).toBe("[filtre]");
        expect(filterSecrets("PWD: secret123")).toBe("[filtre]");
        expect(filterSecrets("api_key=abcdef")).toBe("[filtre]");
        expect(filterSecrets("dolapikey=XYZ789")).toBe("[filtre]");
        expect(filterSecrets("DOLAPIKEY: abc")).toBe("[filtre]");
    });

    it("masks token in query string", () => {
        expect(filterSecrets("GET /api?token=abc123")).toBe("GET /api?[filtre]");
    });

    it("leaves ordinary text untouched", () => {
        expect(filterSecrets("GET /users 200 OK")).toBe("GET /users 200 OK");
    });
});

describe("log ring buffer", () => {
    beforeEach(() => {
        setLogBufferEnabled(true);
        // Drain the buffer by disabling + re-enabling
        setLogBufferEnabled(false);
        setLogBufferEnabled(true);
    });

    it("captures log entries via createLogger", () => {
        const log = createLogger("test-ns");
        log.error("something broke", { code: 42 });

        const entries = getRecentLogs();
        expect(entries.length).toBeGreaterThanOrEqual(1);
        const last = entries[entries.length - 1];
        expect(last).toContain("ERROR");
        expect(last).toContain("[test-ns]");
        expect(last).toContain("something broke");
        expect(last).toContain("42");
    });

    it("filters secrets in buffered entries", () => {
        const log = createLogger("test-ns");
        log.info("auth with Bearer abc.def.ghi failed");

        const entries = getRecentLogs();
        const last = entries[entries.length - 1];
        expect(last).not.toContain("abc.def.ghi");
        expect(last).toContain("[filtre]");
    });

    it("respects the 200-entry cap", () => {
        const log = createLogger("flood");
        for (let i = 0; i < 250; i++) {
            log.debug(`entry ${i}`);
        }

        const entries = getRecentLogs();
        expect(entries.length).toBeLessThanOrEqual(200);
        // Oldest entries are evicted: the first surviving entry is not "entry 0"
        expect(entries[0]).not.toContain("entry 0");
        // Newest entry is present
        expect(entries[entries.length - 1]).toContain("entry 249");
    });

    it("respects the 32 KB byte cap", () => {
        const log = createLogger("big");
        const bigMessage = "x".repeat(500);
        for (let i = 0; i < 100; i++) {
            log.debug(bigMessage);
        }

        const entries = getRecentLogs();
        const totalBytes = entries.reduce((sum, e) => sum + e.length + 1, 0);
        expect(totalBytes).toBeLessThanOrEqual(32 * 1024);
    });

    it("stops capturing when disabled", () => {
        setLogBufferEnabled(false);
        const log = createLogger("off");
        log.error("should not be buffered");

        const entries = getRecentLogs();
        expect(entries.length).toBe(0);
    });

    it("clears the buffer when disabled", () => {
        const log = createLogger("drain");
        log.error("before disable");
        expect(getRecentLogs().length).toBeGreaterThanOrEqual(1);

        setLogBufferEnabled(false);
        expect(getRecentLogs().length).toBe(0);

        setLogBufferEnabled(true);
    });
});
