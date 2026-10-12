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
