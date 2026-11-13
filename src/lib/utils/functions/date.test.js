import { describe, it, expect, afterEach } from "vitest";

import { formatDate, formatTime, formatSeconds, durationFormat, ISOFormat } from "./date";
import { DurationFormatter } from "./intl";

describe("formatDate", () => {
    it("replaces every occurrence of a token", () => {
        const date = new Date(2026, 10, 13, 9, 5, 7);
        expect(formatDate(date, "DD/MM/YYYY - DD")).toBe("13/11/2026 - 13");
        expect(formatDate(date, "YY-MM-DD HH:mm:ss")).toBe("26-11-13 09:05:07");
    });

    it("writes 12-hour clock hours, midnight included", () => {
        expect(formatDate(new Date(2026, 0, 1, 0, 30), "hh:mm")).toBe("12:30");
        expect(formatDate(new Date(2026, 0, 1, 15, 0), "hh:mm")).toBe("03:00");
        expect(formatDate(new Date(2026, 0, 1, 9, 0), "hh")).toBe("09");
    });
});

describe("formatTime", () => {
    it("adds up hours, minutes and seconds", () => {
        expect(formatTime("01:02:03")).toBe(3723);
        expect(formatTime("00:30")).toBe(1800);
    });

    it("returns null for something that is not a time", () => {
        expect(formatTime("")).toBeNull();
        expect(formatTime("abc")).toBeNull();
        expect(formatTime(undefined)).toBeNull();
    });
});

describe("formatSeconds", () => {
    it("keeps counting hours past a day", () => {
        expect(formatSeconds(90000)).toBe("25:00");
        expect(formatSeconds(5400)).toBe("01:30");
    });
});

describe("ISOFormat", () => {
    it("formats date, time or both", () => {
        const date = new Date(2026, 10, 13, 9, 30);
        expect(ISOFormat(date)).toBe("2026-11-13T09:30");
        expect(ISOFormat(date, "date")).toBe("2026-11-13");
        expect(ISOFormat(date, "time")).toBe("09:30");
    });
});

describe("DurationFormatter / durationFormat", () => {
    const nativeDurationFormat = Intl.DurationFormat;

    afterEach(() => {
        if (nativeDurationFormat) {
            Intl.DurationFormat = nativeDurationFormat;
        } else {
            delete Intl.DurationFormat;
        }
    });

    it("formats a duration, not a date, without Intl.DurationFormat", () => {
        delete Intl.DurationFormat;
        expect(DurationFormatter("en").format({ hours: 2 })).toBe("2h");
        expect(DurationFormatter("en", { style: "long" }).format({ hours: 1, minutes: 30 })).toBe("1 hour 30 minutes");
        expect(durationFormat({ days: 2 }, undefined, "en")).toBe("2d");
    });

    it("formats an empty duration as zero seconds", () => {
        delete Intl.DurationFormat;
        expect(DurationFormatter("en", { style: "long" }).format({})).toBe("0 seconds");
    });

    it("uses Intl.DurationFormat when the browser has it", () => {
        const calls = [];
        Intl.DurationFormat = class {
            constructor(locale, options) {
                calls.push({ locale, options });
            }
            format(duration) {
                return `native ${duration.hours}`;
            }
        };
        expect(durationFormat({ hours: 3 }, { style: "short" }, "default")).toBe("native 3");
        // "default" is not a locale Intl.DurationFormat accepts.
        expect(calls).toEqual([{ locale: undefined, options: { style: "short" } }]);
    });

    it("returns null without a duration", () => {
        expect(durationFormat(null)).toBeNull();
    });
});
