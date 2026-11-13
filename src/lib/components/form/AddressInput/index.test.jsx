import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { AddressInput } from "./";
import { propTypes } from "./props";

const nominatimResult = [
    { address: { house_number: "1", road: "Rue de la Paix", postcode: "75002", city: "Paris", country: "France" } },
];

describe("AddressInput - disabled and readOnly", () => {
    let fetchMock;

    beforeEach(() => {
        vi.useFakeTimers();
        fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(nominatimResult) }));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    const type = (input, text) => {
        fireEvent.change(input, { target: { value: text } });
        act(() => {
            vi.advanceTimersByTime(1000);
        });
    };

    it("looks addresses up when editable", async () => {
        render(<AddressInput label="Address" />);
        type(screen.getByLabelText("Address"), "1 rue de la paix");
        await act(async () => {});
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/Rue de la Paix/)).toBeTruthy();
    });

    it.each([["disabled"], ["readOnly"]])("is not editable and does not search when %s", (flag) => {
        const onChange = vi.fn();
        render(<AddressInput label="Address" value="" onChange={onChange} {...{ [flag]: true }} />);
        const input = screen.getByLabelText("Address");

        expect(input[flag]).toBe(true);

        type(input, "1 rue de la paix");
        expect(onChange).not.toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
        expect(screen.queryByRole("list")).toBeNull();
    });

    it("drops the suggestion list and the pending lookup once locked", async () => {
        const { rerender } = render(<AddressInput label="Address" />);
        type(screen.getByLabelText("Address"), "1 rue de la paix");
        await act(async () => {});
        expect(screen.getByRole("list")).toBeTruthy();

        rerender(<AddressInput label="Address" readOnly />);
        expect(screen.queryByRole("list")).toBeNull();
    });
});

describe("AddressInput - accessibility", () => {
    it("names the input after the visible label", () => {
        render(<AddressInput label="Address" />);
        expect(screen.getByRole("textbox", { name: "Address" }).tagName).toBe("INPUT");
    });

    it("uses the consumer id on the input", () => {
        render(<AddressInput id="delivery" label="Address" />);
        expect(screen.getByLabelText("Address").id).toBe("delivery");
    });

    it("links a consumer error message to the input", () => {
        render(<AddressInput id="delivery" label="Address" error="Unknown address" />);
        const input = screen.getByLabelText("Address");
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toBe("delivery-error");
        expect(document.getElementById("delivery-error").textContent).toBe("Unknown address");
    });
});

describe("AddressInput - styling slots", () => {
    it("declares only the slots the component reads", () => {
        const dead = ["requiredStarProps", "inputContainerProps", "inputProps", "inputSpinnerProps", "inputIconProps", "listProps", "listItemProps"];
        expect(Object.keys(propTypes).filter(key => dead.includes(key))).toEqual([]);
    });

    it("styles the inner input through the Input slot", () => {
        render(<AddressInput label="Address" Input={{ inputProps: { "data-testid": "field" } }} />);
        expect(screen.getByTestId("field").tagName).toBe("INPUT");
    });
});
