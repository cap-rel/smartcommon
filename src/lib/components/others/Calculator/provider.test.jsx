import { describe, it, expect, vi } from "vitest";
import { useEffect } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { CalculatorProvider } from "./index";
import { useCalculator } from "./useCalculator";
import { fr } from "lib/locales/fr";

// Hands the context value to the test after each render.
const Probe = ({ onValue }) => {
    const value = useCalculator();
    useEffect(() => {
        onValue(value);
    });
    return null;
};

let calculator;
const renderProvider = () => render(
    <CalculatorProvider labels={fr.Calculator} showFab={false}>
        <Probe onValue={(value) => { calculator = value; }} />
    </CalculatorProvider>
);

// Computes 1 + 1 on the open calculator.
const computeTwo = () => {
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Additionner" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Égal" }));
};

describe("CalculatorProvider", () => {
    it("sends the result to the callback of the current opening", () => {
        const onResult = vi.fn();
        renderProvider();

        act(() => calculator.open(onResult));
        computeTwo();

        expect(onResult).toHaveBeenCalledWith(2);
    });

    it("does not send the result to a previous caller after a toggle close", () => {
        const first = vi.fn();
        renderProvider();

        act(() => calculator.open(first));
        act(() => calculator.toggle());
        const second = vi.fn();
        act(() => calculator.open(second));
        act(() => calculator.toggle());
        act(() => calculator.open());
        computeTwo();

        expect(first).not.toHaveBeenCalled();
        expect(second).not.toHaveBeenCalled();
    });

    it("forgets the previous callback when opened again without one", () => {
        const first = vi.fn();
        renderProvider();

        act(() => calculator.open(first));
        act(() => calculator.open());
        computeTwo();

        expect(first).not.toHaveBeenCalled();
    });
});
