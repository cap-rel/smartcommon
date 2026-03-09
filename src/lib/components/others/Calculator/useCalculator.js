import { createContext, useContext } from "react";

// Calculator Context for global control
export const CalculatorContext = createContext(null);

export const useCalculator = () => {
    const context = useContext(CalculatorContext);
    if (!context) {
        throw new Error("useCalculator must be used within a CalculatorProvider");
    }
    return context;
};
