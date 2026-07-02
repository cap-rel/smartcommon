import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Popup } from "./index";

describe("Popup - keepMounted", () => {
    it("keeps children in the DOM when closed, by default (preserves close animation)", () => {
        const { queryByText } = render(
            <Popup isOpen={false} title="t">
                <span>popup-body</span>
            </Popup>
        );
        expect(queryByText("popup-body")).not.toBeNull();
    });

    it("unmounts children when closed and keepMounted is false", () => {
        const { queryByText } = render(
            <Popup isOpen={false} keepMounted={false} title="t">
                <span>popup-body</span>
            </Popup>
        );
        expect(queryByText("popup-body")).toBeNull();
    });

    it("still renders children when open even with keepMounted false", () => {
        const { queryByText } = render(
            <Popup isOpen={true} keepMounted={false} title="t">
                <span>popup-body</span>
            </Popup>
        );
        expect(queryByText("popup-body")).not.toBeNull();
    });
});
