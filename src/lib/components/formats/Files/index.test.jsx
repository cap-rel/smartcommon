/**
 * Files - `display="count"` variant tests.
 *
 * The list mode (default) is covered by formats/index.test.jsx. The
 * tests here focus on the new typographic-counter mode introduced for
 * card / table views.
 *
 * API:
 *   <Files value={photos} display="count" type="photos" />
 *
 *   display: "list" | "count"     (default "list")
 *   type   : "photos" | "videos" | "audios" | "files"   (default "files")
 *
 * Labels can be overridden via `labels.count[<type>] = (n) => string`.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Files } from "./index";

const makeFiles = (n) =>
    Array.from({ length: n }, (_, i) => ({
        name: `f-${i}.pdf`,
        size: 1024,
        url: `/f-${i}.pdf`,
    }));

describe("formats/Files - display=count variant", () => {
    it("renders the plural form with the count for a multi-item array", () => {
        const { container } = render(
            <Files display="count" type="photos" value={makeFiles(3)} />
        );
        expect(container.textContent.trim()).toBe("3 photos");
    });

    it("renders the singular form for one item", () => {
        const { container } = render(
            <Files display="count" type="photos" value={makeFiles(1)} />
        );
        expect(container.textContent.trim()).toBe("1 photo");
    });

    it("renders zero-count using the plural form for value=null", () => {
        const { container } = render(
            <Files display="count" type="photos" value={null} />
        );
        expect(container.textContent.trim()).toBe("0 photos");
    });

    it("renders zero-count for value=[]", () => {
        const { container } = render(
            <Files display="count" type="videos" value={[]} />
        );
        expect(container.textContent.trim()).toBe("0 videos");
    });

    it("defaults type to `files` when omitted", () => {
        const { container } = render(
            <Files display="count" value={makeFiles(2)} />
        );
        expect(container.textContent.trim()).toBe("2 files");
    });

    it("renders `1 file` (singular) for type=files with one item", () => {
        const { container } = render(
            <Files display="count" type="files" value={makeFiles(1)} />
        );
        expect(container.textContent.trim()).toBe("1 file");
    });

    it("handles `audios` and `videos` types", () => {
        const { container: c1 } = render(
            <Files display="count" type="audios" value={makeFiles(5)} />
        );
        expect(c1.textContent.trim()).toBe("5 audios");

        const { container: c2 } = render(
            <Files display="count" type="videos" value={makeFiles(7)} />
        );
        expect(c2.textContent.trim()).toBe("7 videos");
    });

    it("respects a consumer-provided labels.count override for the matching type", () => {
        const { container } = render(
            <Files
                display="count"
                type="photos"
                value={makeFiles(4)}
                labels={{
                    count: {
                        photos: (n) => `${n} images`,
                    },
                }}
            />
        );
        expect(container.textContent.trim()).toBe("4 images");
    });

    it("accepts a single file (not wrapped in an array) and counts it as 1", () => {
        const { container } = render(
            <Files
                display="count"
                type="files"
                value={{ name: "x.pdf", url: "/x.pdf" }}
            />
        );
        expect(container.textContent.trim()).toBe("1 file");
    });

    it("does not regress list mode: display default stays `list`", () => {
        const { container } = render(<Files value={makeFiles(3)} />);
        // List mode shows file names; count mode would show "3 files".
        expect(container.textContent).toContain("f-0.pdf");
        expect(container.textContent).not.toBe("3 files");
    });

    it("falls back to the `files` label if an unknown type is passed", () => {
        const { container } = render(
            <Files display="count" type="no-such-type" value={makeFiles(2)} />
        );
        expect(container.textContent.trim()).toBe("2 files");
    });
});
