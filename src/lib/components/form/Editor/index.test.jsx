import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Editor } from "./";
import { fr } from "lib/locales";

describe("Editor - mode buttons follow labels", () => {
    it("names the buttons in English by default", () => {
        render(<Editor label="Notes" />);
        expect(screen.getByRole("button", { name: "Markdown" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Preview" })).toBeTruthy();
    });

    it("takes the texts from a locale bundle", () => {
        render(<Editor label="Notes" labels={fr.Editor} />);
        expect(screen.getByRole("button", { name: "Markdown" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Rendu" })).toBeTruthy();
    });

    it("lets the consumer override one text and keeps the other default", () => {
        render(<Editor label="Notes" labels={{ previewButton: "View" }} />);
        expect(screen.getByRole("button", { name: "View" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Markdown" })).toBeTruthy();
    });
});

describe("Editor - Label slots", () => {
    it("styles the required star through starProps", () => {
        render(<Editor label="Notes" required starProps={{ "data-testid": "star", className: "text-blue-500" }} />);
        expect(screen.getByTestId("star").className).toContain("text-blue-500");
    });

    it("still accepts the former requiredStarProps name", () => {
        render(<Editor label="Notes" required requiredStarProps={{ "data-testid": "star" }} />);
        expect(screen.getByTestId("star").textContent).toBe("*");
    });

    it("applies containerProps and labelProps to the label wrapper", () => {
        render(<Editor label="Notes" containerProps={{ "data-testid": "outer" }} labelProps={{ "data-testid": "label" }} />);
        expect(screen.getByTestId("outer").contains(screen.getByRole("textbox"))).toBe(true);
        expect(screen.getByTestId("label").textContent).toBe("Notes");
    });
});
