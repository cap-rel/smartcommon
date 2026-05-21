import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaStar } from "react-icons/fa6";

import { Number, Files, Datetime, Signature, Duration, IconDisplay } from "./index";

describe("formats/Number", () => {
    it("formats a decimal value with French locale", () => {
        const { container } = render(<Number value={1234.5} locale="fr-FR" />);
        // French uses NBSP as thousands separator and comma as decimal separator.
        const text = container.textContent.replace(/\s/g, " ");
        expect(text).toContain("1");
        expect(text).toContain("234,5");
    });

    it("formats a currency value with the EUR symbol", () => {
        const { container } = render(
            <Number value={42} locale="fr-FR" style="currency" currency="EUR" />
        );
        expect(container.textContent).toMatch(/€|EUR/);
    });

    it("returns null for nil values", () => {
        const { container } = render(<Number value={null} />);
        expect(container.firstChild).toBeNull();
    });

    it("returns null for non-numeric strings", () => {
        const { container } = render(<Number value="not-a-number" />);
        expect(container.firstChild).toBeNull();
    });
});

describe("formats/Datetime", () => {
    it("formats an epoch in seconds (no longer returns the raw value)", () => {
        // 2026-01-15 12:00:00 UTC
        const epochSeconds = 1768521600;
        const { container } = render(
            <Datetime value={epochSeconds} locale="fr-FR" />
        );
        const text = container.textContent;
        expect(text).not.toBe(String(epochSeconds));
        expect(text).toMatch(/2026/);
    });

    it("formats an ISO string", () => {
        const { container } = render(
            <Datetime value="2026-05-08T12:00:00Z" locale="en-US" />
        );
        expect(container.textContent).toMatch(/2026/);
    });

    it("returns null for nil or invalid values", () => {
        const { container, rerender } = render(<Datetime value={null} />);
        expect(container.firstChild).toBeNull();
        rerender(<Datetime value="not-a-date" />);
        expect(container.firstChild).toBeNull();
    });
});

describe("formats/Duration", () => {
    it("formats a number of seconds into a human readable string", () => {
        const { container } = render(<Duration value={90} locale="fr-FR" />);
        // Either Intl.DurationFormat output or fallback - both must mention minute(s).
        expect(container.textContent.toLowerCase()).toMatch(/min|m\b/);
    });

    it("accepts a duration object", () => {
        const { container } = render(
            <Duration value={{ hours: 1, minutes: 30 }} locale="fr-FR" />
        );
        expect(container.textContent.length).toBeGreaterThan(0);
    });

    it("returns null for nil values", () => {
        const { container } = render(<Duration value={null} />);
        expect(container.firstChild).toBeNull();
    });
});

describe("formats/Signature", () => {
    it("renders an image when given a value with a signature URL", () => {
        render(
            <Signature
                value={{ signature: "data:image/png;base64,iVBORw0K", signer: "Alice" }}
            />
        );
        const img = screen.getByAltText("Alice");
        expect(img.tagName).toBe("IMG");
        expect(img.getAttribute("src")).toBe("data:image/png;base64,iVBORw0K");
    });

    it("accepts a raw string URL as value", () => {
        const { container } = render(<Signature value="https://example.com/sig.png" />);
        const img = container.querySelector("img");
        expect(img).not.toBeNull();
        expect(img.getAttribute("src")).toBe("https://example.com/sig.png");
    });

    it("returns null for nil or empty values", () => {
        const { container, rerender } = render(<Signature value={null} />);
        expect(container.firstChild).toBeNull();
        rerender(<Signature value={{}} />);
        expect(container.firstChild).toBeNull();
    });
});

describe("formats/Files", () => {
    it("renders the empty label when value is null or empty", () => {
        const { container, rerender } = render(<Files value={null} />);
        expect(container.textContent).toContain("No file");
        rerender(<Files value={[]} />);
        expect(container.textContent).toContain("No file");
    });

    it("renders one entry per file with a download link", () => {
        render(
            <Files
                value={[
                    { name: "report.pdf", size: 2048, url: "/files/report.pdf" },
                    { name: "photo.jpg", size: 5_000_000, url: "/files/photo.jpg" },
                ]}
            />
        );
        const reportLink = screen.getByRole("link", { name: /report\.pdf/i });
        expect(reportLink.getAttribute("href")).toBe("/files/report.pdf");
        expect(reportLink.hasAttribute("download")).toBe(true);
        expect(screen.getByText(/photo\.jpg/)).toBeDefined();
    });

    it("renders the formatted size next to the name", () => {
        const { container } = render(
            <Files value={[{ name: "doc.txt", size: 1024, url: "/d.txt" }]} />
        );
        expect(container.textContent).toMatch(/1\s?KB/i);
    });

    it("respects custom labels.empty", () => {
        const { container } = render(
            <Files value={[]} labels={{ empty: "No files" }} />
        );
        expect(container.textContent).toContain("No files");
    });
});

describe("formats/IconDisplay", () => {
    it("renders a passed-in icon component", () => {
        const { container } = render(<IconDisplay icon={FaStar} label="Favori" />);
        expect(container.textContent).toContain("Favori");
        expect(container.querySelector("svg")).not.toBeNull();
    });

    it("renders a passed-in icon element", () => {
        const { container } = render(<IconDisplay value={<FaStar data-testid="star" />} />);
        expect(container.querySelector('[data-testid="star"]')).not.toBeNull();
    });

    it("returns null when no icon is provided", () => {
        const { container } = render(<IconDisplay />);
        expect(container.firstChild).toBeNull();
    });
});
