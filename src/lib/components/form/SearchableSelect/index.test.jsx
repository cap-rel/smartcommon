import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { SearchableSelect } from "./";
import { fr } from "lib/locales";

const options = [
    { label: "France", value: "fr" },
    { label: "Germany", value: "de" },
];

const searchFor = (text) => {
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: text } });
};

describe("SearchableSelect - containerProps", () => {
    it("applies containerProps to a single element", () => {
        const { container } = render(
            <SearchableSelect label="Country" options={options} containerProps={{ "data-testid": "outer", className: "my-outer" }} />
        );
        expect(screen.getAllByTestId("outer")).toHaveLength(1);
        expect(container.querySelectorAll(".my-outer")).toHaveLength(1);
    });

    it("puts containerProps on the outer wrapper, around the label", () => {
        render(<SearchableSelect label="Country" options={options} containerProps={{ "data-testid": "outer" }} />);
        const outer = screen.getByTestId("outer");
        expect(outer.contains(screen.getByText("Country"))).toBe(true);
        expect(outer.contains(screen.getByRole("textbox"))).toBe(true);
    });

    it("styles the input and dropdown wrapper through selectContainerProps", () => {
        render(<SearchableSelect label="Country" options={options} selectContainerProps={{ "data-testid": "inner" }} />);
        const inner = screen.getByTestId("inner");
        expect(inner.contains(screen.getByRole("textbox"))).toBe(true);
        expect(inner.contains(screen.getByText("Country"))).toBe(false);
    });
});

describe("SearchableSelect - empty result text", () => {
    it("says so in English by default", () => {
        render(<SearchableSelect options={options} />);
        searchFor("zzz");
        expect(screen.getByText("No results")).toBeTruthy();
    });

    it("takes the text from a locale bundle", () => {
        render(<SearchableSelect options={options} labels={fr.SearchableSelect} />);
        searchFor("zzz");
        expect(screen.getByText("Aucun résultat")).toBeTruthy();
    });

    it("lets the consumer override the text", () => {
        render(<SearchableSelect options={options} labels={{ noResults: "Nothing matches" }} />);
        searchFor("zzz");
        expect(screen.getByText("Nothing matches")).toBeTruthy();
    });
});
