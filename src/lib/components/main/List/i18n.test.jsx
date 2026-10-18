import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { List } from "./";
import { Array as ArrayField } from "lib/components/form/Array";
import { SearchableSelect } from "lib/components/form/SearchableSelect";
import { fr } from "lib/locales";

describe("placeholders follow labels", () => {
    it("List search input defaults to English and accepts a bundle", () => {
        const { unmount } = render(<List searchProps={[{}]} />);
        expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
        unmount();

        render(<List searchProps={[{}]} labels={fr.List} />);
        expect(screen.getByPlaceholderText("Rechercher...")).toBeTruthy();
    });

    it("Array add input defaults to English", () => {
        render(<ArrayField />);
        expect(screen.getByPlaceholderText("Add...")).toBeTruthy();
    });

    it("SearchableSelect keeps an explicit placeholder over the label", () => {
        const { unmount } = render(<SearchableSelect options={[]} />);
        expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
        unmount();

        render(<SearchableSelect options={[]} placeholder="Pick a customer" />);
        expect(screen.getByPlaceholderText("Pick a customer")).toBeTruthy();
    });
});
