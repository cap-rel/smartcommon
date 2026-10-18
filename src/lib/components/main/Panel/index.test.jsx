import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Panel } from "./";

describe("Panel - title", () => {
    it("renders the title above the children", () => {
        render(<Panel isOpen title="Filters"><span>body</span></Panel>);
        const title = screen.getByText("Filters");
        const body = screen.getByText("body");
        expect(title.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("renders no title element without the prop", () => {
        render(<Panel isOpen><span>body</span></Panel>);
        expect(screen.queryByText("Filters")).toBeNull();
    });

    it("applies dashProps to the drag handle", () => {
        render(<Panel isOpen dashProps={{ "data-testid": "dash" }}><span>body</span></Panel>);
        expect(screen.getByTestId("dash").className).toContain("rounded-full");
    });
});
