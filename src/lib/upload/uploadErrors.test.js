import { describe, it, expect } from "vitest";

import { isUploadSizeRefusal, readErrorBody, toMegabytes, uploadFailureDetail } from "./uploadErrors";

describe("uploadFailureDetail", () => {
    it("keeps the HTTP status a proxy or the server answered", () => {
        expect(uploadFailureDetail({ response: { status: 413 } })).toEqual({ kind: "http", status: 413 });
    });

    it("reports a timeout with the duration the request ran with", () => {
        expect(uploadFailureDetail({ name: "TimeoutError" })).toEqual({ kind: "timeout", seconds: 120 });
        expect(uploadFailureDetail({ name: "TimeoutError" }, 30000)).toEqual({ kind: "timeout", seconds: 30 });
    });

    it("names the 5xx behind a request the circuit breaker blocked", () => {
        expect(uploadFailureDetail({ circuitOpen: true, circuitStatus: 503 })).toEqual({ kind: "http", status: 503 });
    });

    it("reports a network failure when nothing came back", () => {
        expect(uploadFailureDetail(new TypeError("Failed to fetch"))).toEqual({ kind: "network", message: "Failed to fetch" });
    });
});

describe("isUploadSizeRefusal", () => {
    it("recognizes the size refusals of every layer", () => {
        expect(isUploadSizeRefusal({ response: { status: 413 } })).toBe(true);
        expect(isUploadSizeRefusal({}, { error: "No file accepted", details: [{ error: "File exceeds server limit" }] })).toBe(true);
        expect(isUploadSizeRefusal({}, { details: [{ error: "File too large (max 10485760 bytes)" }] })).toBe(true);
        expect(isUploadSizeRefusal({ apiMessage: "No file uploaded" })).toBe(true);
        expect(isUploadSizeRefusal({ apiMessage: "Disk full" }, { error: "Disk full" })).toBe(false);
    });
});

describe("readErrorBody", () => {
    it("reads the JSON body through a clone, null without response or JSON", async () => {
        const response = new Response(JSON.stringify({ error: "boom" }), { status: 400, headers: { "Content-Type": "application/json" } });
        expect(await readErrorBody({ response })).toEqual({ error: "boom" });
        expect(await response.json()).toEqual({ error: "boom" });
        expect(await readErrorBody(new TypeError("Failed to fetch"))).toBeNull();
        expect(await readErrorBody({ response: new Response("<h1>413</h1>", { status: 413 }) })).toBeNull();
    });
});

describe("toMegabytes", () => {
    it("rounds to one decimal", () => {
        expect(toMegabytes(3 * 1024 * 1024)).toBe(3);
        expect(toMegabytes(200 * 1024)).toBe(0.2);
    });
});
