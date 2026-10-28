import { describe, it, expect, beforeEach } from "vitest";

import {
    createLogger,
    getRecentLogs,
    filterSecrets,
    setLogBufferEnabled,
} from "./consoleLogs";

describe("filterSecrets", () => {
    it("masks Bearer tokens", () => {
        expect(filterSecrets("using Bearer abc.def.ghi token")).toBe("using [filtré] token");
    });

    it("masks Authorization header lines", () => {
        expect(filterSecrets("Authorization: Basic dXNlcjpwYXNz")).toBe("[filtré]");
    });

    it("masks JWTs", () => {
        const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.abc123signature";
        expect(filterSecrets(`token is ${jwt} here`)).toBe("token is [filtré] here");
    });

    it("masks password-like key=value pairs, case-insensitive", () => {
        expect(filterSecrets("password=hunter2")).toBe("[filtré]");
        expect(filterSecrets("PWD: secret123")).toBe("[filtré]");
        expect(filterSecrets("api_key=abcdef")).toBe("[filtré]");
        expect(filterSecrets("dolapikey=XYZ789")).toBe("[filtré]");
        expect(filterSecrets("DOLAPIKEY: abc")).toBe("[filtré]");
    });

    it("masks token in query string", () => {
        expect(filterSecrets("GET /api?token=abc123")).toBe("GET /api?[filtré]");
    });

    it("masks secrets inside JSON-serialized objects", () => {
        // Objects passed to log.info("login", credentials) are serialized
        // with JSON.stringify: the separator is ":" with a quote between
        // the key and the colon, and the value is quoted.
        const out = filterSecrets('{"password":"hunter2","refresh_token":"abc123def","apikey":"K"}');
        expect(out).not.toContain("hunter2");
        expect(out).not.toContain("abc123def");
        expect(out).toContain("[filtré]");
    });

    it("masks access_token and spaced or quoted separator variants", () => {
        expect(filterSecrets('{"access_token": "abc.def"}')).not.toContain("abc.def");
        expect(filterSecrets("password: 'hunter2'")).not.toContain("hunter2");
        expect(filterSecrets("Secret = topsecret")).not.toContain("topsecret");
    });

    it("masks key suffixes (password_confirmation, secret_key)", () => {
        // Standard Laravel form fields: the suffix must not let the
        // whole pair through.
        expect(filterSecrets('{"password_confirmation":"hunter2"}')).toBe("{[filtré]}");
        expect(filterSecrets('{"secret_key":"abc"}')).toBe("{[filtré]}");
        expect(filterSecrets("password_confirmation=hunter2")).toBe("[filtré]");
    });

    it("masks quoted values containing spaces or escaped quotes", () => {
        // A passphrase with spaces, and a value whose quote is escaped:
        // the value must be consumed in full, no fragment may leak.
        expect(filterSecrets('{"password":"my secret pass"}')).toBe("{[filtré]}");
        expect(filterSecrets('{"token":"a\\"b"}')).toBe("{[filtré]}");
        expect(filterSecrets('{"password":"my secret pass"}')).not.toContain("secret pass");
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
        expect(last).toContain("[filtré]");
    });

    it("filters secrets from logged objects, not only from strings", () => {
        const log = createLogger("test-ns");
        log.info("login attempt", { password: "hunter2", refresh_token: "abc123def", apikey: "K" });

        const entries = getRecentLogs();
        const last = entries[entries.length - 1];
        expect(last).not.toContain("hunter2");
        expect(last).not.toContain("abc123def");
        expect(last).toContain("[filtré]");
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

    it("counts the byte budget in UTF-8 octets, not in characters", () => {
        const log = createLogger("utf8");
        // Each é is 2 octets in UTF-8: a character-based budget would let
        // the buffer hold twice as much text as the 32 KB the server
        // accepts (it answers 422 without truncating).
        const accented = "é".repeat(600);
        for (let i = 0; i < 100; i++) {
            log.debug(accented);
        }

        const entries = getRecentLogs();
        const totalBytes = entries.reduce(
            (sum, e) => sum + new TextEncoder().encode(e).length + 1,
            0
        );
        expect(totalBytes).toBeLessThanOrEqual(32 * 1024);
        // A character-based budget would hold about 51 of these lines.
        expect(entries.length).toBeLessThan(40);
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
