import { describe, it, expect } from "vitest";

import {
    timestampToDate,
    timestampToDateTime,
    isArrayOfObjects,
    secsToTime,
    mToKm,
    hexToRgb,
} from "./others";

describe("timestampToDate / timestampToDateTime", () => {
    // 2026-11-13 09:30:00 UTC; the expected strings use local time.
    const ts = Date.UTC(2026, 10, 13, 9, 30) / 1000;
    const local = new Date(ts * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    const day = `${pad(local.getDate())}/${pad(local.getMonth() + 1)}/${local.getFullYear()}`;

    it("formats a numeric timestamp", () => {
        expect(timestampToDate(ts)).toBe(day);
        expect(timestampToDateTime(ts)).toBe(`${day} ${pad(local.getHours())}:${pad(local.getMinutes())}`);
    });

    it("accepts a numeric string, as Dolibarr sends them", () => {
        expect(timestampToDate(String(ts))).toBe(day);
    });

    it("returns undefined without a timestamp or with garbage", () => {
        expect(timestampToDate(undefined)).toBeUndefined();
        expect(timestampToDate(null)).toBeUndefined();
        expect(timestampToDate("")).toBeUndefined();
        expect(timestampToDateTime("not a date")).toBeUndefined();
    });
});

describe("isArrayOfObjects", () => {
    it("is false as soon as one item is not an object", () => {
        expect(isArrayOfObjects([{ a: 1 }, "b"])).toBe(false);
        expect(isArrayOfObjects([{ a: 1 }, null])).toBe(false);
        expect(isArrayOfObjects([1, 2])).toBe(false);
    });

    it("is true for objects only, false for a non array", () => {
        expect(isArrayOfObjects([{ a: 1 }, { b: 2 }])).toBe(true);
        expect(isArrayOfObjects("x")).toBe(false);
    });
});

describe("secsToTime", () => {
    it("formats whole hours and minutes", () => {
        expect(secsToTime(3600)).toBe("01 h 00");
        expect(secsToTime(5400)).toBe("01 h 30");
        expect(secsToTime(600)).toBe("10 min");
    });

    it("says less than a minute for short or empty durations", () => {
        expect(secsToTime(0)).toBe("moins d'une minute");
        expect(secsToTime(59)).toBe("moins d'une minute");
    });
});

describe("mToKm", () => {
    it("keeps one truncated decimal in kilometres", () => {
        expect(mToKm(2000)).toBe("2,0 km");
        expect(mToKm(1580)).toBe("1,5 km");
    });

    it("stays in metres under a kilometre", () => {
        expect(mToKm(850)).toBe("850 m");
        expect(mToKm(0)).toBe("0 m");
    });
});

describe("hexToRgb", () => {
    it("keeps zero channels", () => {
        expect(hexToRgb("#000")).toBe("0, 0, 0");
        expect(hexToRgb("#ff0080")).toBe("255, 0, 128");
    });

    it("marks only unparsable channels", () => {
        expect(hexToRgb("#zz0000")).toBe("?, 0, 0");
    });
});
