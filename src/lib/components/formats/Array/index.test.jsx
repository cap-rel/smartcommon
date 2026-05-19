/**
 * formats/Array - tests.
 *
 * Pretty-prints an array of "contact-like" objects with a smart
 * default fallback chain:
 *
 *   fullname > firstname + lastname > code > label > email
 *
 * API:
 *   <Array value={array} formatItem={(item) => string} separator=", " />
 *
 * NOTE: this component shadows the global `Array`. Any internal call
 * like `Array.isArray(x)` would crash because the local binding is
 * the React component, not the global. The component therefore uses
 * lodash `isArray`. The static audit in
 * src/lib/tests/globalShadowing.test.jsx + the ESLint rule
 * `local/no-shadowed-global-self-call` guard against regressions.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Array as ArrayFormat } from "./index";

describe("formats/Array - default formatItem fallback chain", () => {
    it("prefers `fullname` over everything else", () => {
        const { container } = render(
            <ArrayFormat
                value={[
                    {
                        fullname: "Jean Dupont",
                        firstname: "Ignored",
                        lastname: "Ignored",
                        email: "ignored@example.com",
                    },
                ]}
            />
        );
        expect(container.textContent).toBe("Jean Dupont");
    });

    it("falls back to firstname + lastname when fullname is absent", () => {
        const { container } = render(
            <ArrayFormat
                value={[{ firstname: "Jean", lastname: "Dupont" }]}
            />
        );
        expect(container.textContent).toBe("Jean Dupont");
    });

    it("handles items with only firstname", () => {
        const { container } = render(
            <ArrayFormat value={[{ firstname: "Jean" }]} />
        );
        expect(container.textContent).toBe("Jean");
    });

    it("handles items with only lastname", () => {
        const { container } = render(
            <ArrayFormat value={[{ lastname: "Dupont" }]} />
        );
        expect(container.textContent).toBe("Dupont");
    });

    it("falls back to code when name fields are absent", () => {
        const { container } = render(
            <ArrayFormat value={[{ code: "C001" }]} />
        );
        expect(container.textContent).toBe("C001");
    });

    it("falls back to label when code is absent", () => {
        const { container } = render(
            <ArrayFormat value={[{ label: "Item label" }]} />
        );
        expect(container.textContent).toBe("Item label");
    });

    it("falls back to email when label is absent", () => {
        const { container } = render(
            <ArrayFormat value={[{ email: "alice@example.com" }]} />
        );
        expect(container.textContent).toBe("alice@example.com");
    });

    it("handles primitive items (string)", () => {
        const { container } = render(
            <ArrayFormat value={["hello", "world"]} />
        );
        expect(container.textContent).toBe("hello, world");
    });

    it("handles primitive items (number)", () => {
        const { container } = render(<ArrayFormat value={[1, 2, 3]} />);
        expect(container.textContent).toBe("1, 2, 3");
    });

    it("uses the provided separator", () => {
        const { container } = render(
            <ArrayFormat
                value={[{ fullname: "Alice" }, { fullname: "Bob" }]}
                separator=" | "
            />
        );
        expect(container.textContent).toBe("Alice | Bob");
    });

    it("uses a custom formatItem if provided", () => {
        const { container } = render(
            <ArrayFormat
                value={[{ firstname: "Jean", lastname: "Dupont" }]}
                formatItem={(item) => `${item.lastname.toUpperCase()}, ${item.firstname}`}
            />
        );
        expect(container.textContent).toBe("DUPONT, Jean");
    });

    it("joins mixed-shape items by applying the fallback per item", () => {
        const { container } = render(
            <ArrayFormat
                value={[
                    { fullname: "Alice" },
                    { firstname: "Bob", lastname: "Marley" },
                    { email: "carol@example.com" },
                ]}
            />
        );
        expect(container.textContent).toBe(
            "Alice, Bob Marley, carol@example.com"
        );
    });
});

describe("formats/Array - edge cases", () => {
    it("renders nothing for value=null", () => {
        const { container } = render(<ArrayFormat value={null} />);
        expect(container.textContent).toBe("");
    });

    it("renders nothing for value=undefined", () => {
        const { container } = render(<ArrayFormat value={undefined} />);
        expect(container.textContent).toBe("");
    });

    it("renders nothing for value=[]", () => {
        const { container } = render(<ArrayFormat value={[]} />);
        expect(container.textContent).toBe("");
    });

    it("does not throw with no props at all", () => {
        expect(() => render(<ArrayFormat />)).not.toThrow();
    });

    it("skips items that produce an empty string (no double separator)", () => {
        const { container } = render(
            <ArrayFormat value={[{ fullname: "Alice" }, {}, { fullname: "Bob" }]} />
        );
        expect(container.textContent).toBe("Alice, Bob");
    });
});
