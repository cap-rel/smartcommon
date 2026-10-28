import { describe, it, expect, beforeEach } from "vitest";

import {
    recordNetworkError,
    getRecentNetworkErrors,
    setNetworkErrorBufferEnabled,
} from "./networkErrors";

describe("network error ring buffer", () => {
    beforeEach(() => {
        setNetworkErrorBufferEnabled(false);
        setNetworkErrorBufferEnabled(true);
    });

    it("records an HTTP error with method, url and status", () => {
        recordNetworkError("GET", "https://api.example.com/users", 500);

        const errors = getRecentNetworkErrors();
        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({
            method: "GET",
            url: "https://api.example.com/users",
            status: 500,
        });
        expect(errors[0].at).toBeTruthy();
    });

    it("strips the query string from the URL", () => {
        recordNetworkError("POST", "https://api.example.com/login?dolapikey=secret123&token=abc", 401);

        const errors = getRecentNetworkErrors();
        expect(errors[0].url).toBe("https://api.example.com/login");
        expect(errors[0].url).not.toContain("dolapikey");
        expect(errors[0].url).not.toContain("secret123");
    });

    it("strips the query string from relative URLs", () => {
        recordNetworkError("GET", "/api.php/products?page=2&token=xyz", 404);

        const errors = getRecentNetworkErrors();
        expect(errors[0].url).toBe("/api.php/products");
    });

    it("normalises the method to uppercase", () => {
        recordNetworkError("post", "https://api.example.com/x", 400);
        expect(getRecentNetworkErrors()[0].method).toBe("POST");
    });

    it("records network-level failures with status 0", () => {
        recordNetworkError("GET", "https://api.example.com/down", 0);
        expect(getRecentNetworkErrors()[0].status).toBe(0);
    });

    it("keeps at most 20 entries", () => {
        for (let i = 0; i < 25; i++) {
            recordNetworkError("GET", `https://api.example.com/err/${i}`, 500);
        }

        const errors = getRecentNetworkErrors();
        expect(errors).toHaveLength(20);
        // Oldest evicted: first surviving entry is err/5
        expect(errors[0].url).toBe("https://api.example.com/err/5");
        expect(errors[19].url).toBe("https://api.example.com/err/24");
    });

    it("stops recording when disabled", () => {
        setNetworkErrorBufferEnabled(false);
        recordNetworkError("GET", "https://api.example.com/x", 500);
        expect(getRecentNetworkErrors()).toHaveLength(0);
    });

    it("clears the buffer when disabled", () => {
        recordNetworkError("GET", "https://api.example.com/x", 500);
        expect(getRecentNetworkErrors()).toHaveLength(1);

        setNetworkErrorBufferEnabled(false);
        expect(getRecentNetworkErrors()).toHaveLength(0);

        setNetworkErrorBufferEnabled(true);
    });
});
