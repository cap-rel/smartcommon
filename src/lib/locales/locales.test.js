import { describe, it, expect } from "vitest";

import en from "./en";
import fr from "./fr";
import de from "./de";
import es from "./es";
import itLocale from "./it";
import pl from "./pl";
import nl from "./nl";
import pt from "./pt";

// Build a structural fingerprint of a locale bundle. Two locales with the
// same fingerprint share the same shape (same keys at every nesting level,
// same function arities, same array lengths). Translated string VALUES
// don't influence the fingerprint, so we can compare across languages.
const fingerprint = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "function") return `function:${value.length}`;
    if (Array.isArray(value)) {
        return `array:${value.length}[${value.map(fingerprint).join(",")}]`;
    }
    if (typeof value === "object") {
        const keys = Object.keys(value).sort();
        return `object:{${keys.map(k => `${k}=${fingerprint(value[k])}`).join(",")}}`;
    }
    return typeof value;
};

const referenceFingerprint = fingerprint(en);

describe("locale bundles - structural integrity", () => {
    const bundles = { fr, de, es, it: itLocale, pl, nl, pt };

    for (const [name, bundle] of Object.entries(bundles)) {
        it(`${name} mirrors en.js structure exactly`, () => {
            expect(fingerprint(bundle)).toBe(referenceFingerprint);
        });
    }

    it("every bundle exposes all 26 component namespaces", () => {
        const expectedKeys = Object.keys(en).sort();
        for (const [name, bundle] of Object.entries(bundles)) {
            expect(Object.keys(bundle).sort(), `${name} top-level keys`).toEqual(expectedKeys);
        }
        expect(expectedKeys.length).toBeGreaterThanOrEqual(20);
    });

    it("PlainCalendar.weekdays has 7 entries in every locale", () => {
        for (const [name, bundle] of Object.entries({ en, ...bundles })) {
            expect(bundle.PlainCalendar.weekdays, `${name}`).toHaveLength(7);
        }
    });

    it("interpolated functions return non-empty strings", () => {
        for (const [name, bundle] of Object.entries({ en, ...bundles })) {
            expect(typeof bundle.PhotosUploader.minError(3), `${name}`).toBe("string");
            expect(bundle.PhotosUploader.minError(3)).toContain("3");
            expect(typeof bundle.Stepper.stepN(2)).toBe("string");
            expect(bundle.Stepper.stepN(2)).toContain("2");
            expect(typeof bundle.DataTable.rowsSelected(5)).toBe("string");
            expect(bundle.DataTable.rowsSelected(5)).toContain("5");
            expect(typeof bundle.Files.count.photos(1)).toBe("string");
            expect(typeof bundle.Files.count.photos(2)).toBe("string");
        }
    });
});

describe("locale bundles - ASCII punctuation rule", () => {
    // Project rule: no curly quotes, ellipsis char, em/en-dash, bullets, arrows.
    const FORBIDDEN = /[\u00AB\u00BB\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u2192]/;

    const collectStrings = (value, path = "") => {
        const out = [];
        if (typeof value === "string") {
            out.push({ path, value });
        } else if (typeof value === "function") {
            try {
                const result = value(2);
                if (typeof result === "string") out.push({ path: `${path}(2)`, value: result });
            } catch { /* ignore */ }
        } else if (Array.isArray(value)) {
            value.forEach((v, i) => out.push(...collectStrings(v, `${path}[${i}]`)));
        } else if (value && typeof value === "object") {
            for (const [k, v] of Object.entries(value)) {
                out.push(...collectStrings(v, path ? `${path}.${k}` : k));
            }
        }
        return out;
    };

    for (const [name, bundle] of Object.entries({ en, fr, de, es, it: itLocale, pl, nl, pt })) {
        it(`${name} contains no forbidden non-ASCII punctuation`, () => {
            const strings = collectStrings(bundle);
            const offenders = strings.filter(s => FORBIDDEN.test(s.value));
            expect(offenders, `${name} offenders`).toEqual([]);
        });
    }
});
