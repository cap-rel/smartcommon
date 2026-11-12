import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Textarea } from "./index";

// The Label renders <label htmlFor={id}>: the id must land on the <textarea>
// itself, otherwise clicking the label focuses nothing and the field has no
// accessible name.
describe("Textarea - id", () => {
    it("puts the id on the textarea so the label targets it", () => {
        render(<Textarea id="comments" label="Commentaire" value="" onChange={() => {}} />);
        const field = screen.getByLabelText("Commentaire");
        expect(field.tagName).toBe("TEXTAREA");
        expect(field.id).toBe("comments");
    });
});

describe("Textarea - generated id and errors", () => {
    it("generates an id when none is given, so the label still targets it", () => {
        render(<Textarea label="Notes" value="" onChange={() => {}} />);
        const field = screen.getByLabelText("Notes");
        expect(field.tagName).toBe("TEXTAREA");
        expect(field.id).toBeTruthy();
    });

    it("gives two textareas distinct ids", () => {
        render(
            <>
                <Textarea label="Notes" value="" onChange={() => {}} />
                <Textarea label="Remarks" value="" onChange={() => {}} />
            </>
        );
        expect(screen.getByLabelText("Notes").id).not.toBe(screen.getByLabelText("Remarks").id);
    });

    it("is neither invalid nor described while no error shows", () => {
        render(<Textarea label="Notes" required value="" onChange={() => {}} />);
        const field = screen.getByLabelText("Notes");
        expect(field.getAttribute("aria-invalid")).toBeNull();
        expect(field.getAttribute("aria-describedby")).toBeNull();
    });

    it("links the shown errors to the textarea and flags it invalid", () => {
        render(<Textarea label="Notes" required value="" formSubmitted onChange={() => {}} />);
        const field = screen.getByLabelText("Notes");
        expect(field.getAttribute("aria-invalid")).toBe("true");
        const describedBy = field.getAttribute("aria-describedby");
        expect(document.getElementById(describedBy).textContent).toBe("This field is required.");
    });
});
