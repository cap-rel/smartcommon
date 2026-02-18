import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { FaCalculator, FaBackspace } from "react-icons/fa";
import { RiCloseLargeLine } from "react-icons/ri";
import { isNil } from "lodash";

import { Button, Overlay } from "lib/components";
import { useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

// Calculator Context for global control
const CalculatorContext = createContext(null);

export const useCalculator = () => {
    const context = useContext(CalculatorContext);
    if (!context) {
        throw new Error("useCalculator must be used within a CalculatorProvider");
    }
    return context;
};

// Calculator logic hook
const useCalculatorLogic = () => {
    const [display, setDisplay] = useState("0");
    const [expression, setExpression] = useState("");
    const [history, setHistory] = useState([]);
    const [memory, setMemory] = useState(0);
    const [waitingForOperand, setWaitingForOperand] = useState(true);
    const [operator, setOperator] = useState(null);
    const [previousValue, setPreviousValue] = useState(null);

    const MAX_HISTORY = 5;

    const calculate = (left, right, op) => {
        switch (op) {
            case "+": return left + right;
            case "-": return left - right;
            case "×": return left * right;
            case "÷": return right !== 0 ? left / right : 0;
            default: return right;
        }
    };

    const inputDigit = (digit) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(prev => prev === "0" ? digit : prev + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay("0.");
            setWaitingForOperand(false);
        } else if (!display.includes(".")) {
            setDisplay(prev => prev + ".");
        }
    };

    const clearAll = () => {
        setDisplay("0");
        setExpression("");
        setWaitingForOperand(true);
        setOperator(null);
        setPreviousValue(null);
    };

    const clearEntry = () => {
        setDisplay("0");
        setWaitingForOperand(true);
    };

    const toggleSign = () => {
        setDisplay(prev => String(-parseFloat(prev)));
    };

    const inputPercent = () => {
        setDisplay(prev => String(parseFloat(prev) / 100));
    };

    const handleOperator = (nextOperator) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(inputValue);
            setExpression(`${inputValue} ${nextOperator}`);
        } else if (operator && !waitingForOperand) {
            const result = calculate(previousValue, inputValue, operator);
            setDisplay(String(result));
            setPreviousValue(result);
            setExpression(`${result} ${nextOperator}`);
            setHistory(prev => [
                { expression: `${previousValue} ${operator} ${inputValue}`, result },
                ...prev,
            ].slice(0, MAX_HISTORY));
        } else {
            setExpression(`${previousValue} ${nextOperator}`);
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const performCalculation = () => {
        if (operator === null || previousValue === null) return null;

        const inputValue = parseFloat(display);
        const result = calculate(previousValue, inputValue, operator);
        const fullExpression = `${previousValue} ${operator} ${inputValue}`;

        setHistory(prev => [
            { expression: fullExpression, result },
            ...prev,
        ].slice(0, MAX_HISTORY));
        setDisplay(String(result));
        setExpression("");
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);

        return result;
    };

    const memoryAdd = () => setMemory(prev => prev + parseFloat(display));
    const memorySubtract = () => setMemory(prev => prev - parseFloat(display));
    const memoryRecall = () => {
        setDisplay(String(memory));
        setWaitingForOperand(true);
    };
    const memoryClear = () => setMemory(0);

    const backspace = () => {
        if (!waitingForOperand && display.length > 1) {
            setDisplay(prev => prev.slice(0, -1));
        } else {
            setDisplay("0");
            setWaitingForOperand(true);
        }
    };

    return {
        display,
        expression,
        history,
        memory,
        inputDigit,
        inputDecimal,
        clearAll,
        clearEntry,
        toggleSign,
        inputPercent,
        handleOperator,
        performCalculation,
        memoryAdd,
        memorySubtract,
        memoryRecall,
        memoryClear,
        backspace,
    };
};

// Calculator Button sub-component
const CalcButton = ({ onClick, children, variant = "default", className = "" }) => {
    const baseStyles = "flex items-center justify-center text-app-base font-app-medium rounded-app-md transition-colors active:scale-95 min-h-12";
    const variants = {
        default: "bg-soft-bg-alt hover:bg-soft-bg-alt/80 text-soft-text",
        operator: "bg-primary/10 hover:bg-primary/20 text-primary",
        action: "bg-primary hover:bg-primary/90 text-primary-text",
        memory: "bg-soft-bg-alt/50 hover:bg-soft-bg-alt text-soft-text-muted text-app-sm min-h-9",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

// Main Calculator Component
export const Calculator = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Calculator", props);

    const {
        id,
        isOpen: controlledIsOpen,
        onOpenChange,
        onResult,
        onClose,
        position = "bottom-right",
        showFab = true,
        showOverlay = true,
        showHistory = true,
        showMemory = true,
        closeOnResult = false,
        title = "Calculator",
        fabIcon: FabIcon = FaCalculator,
        zIndex = 40,
    } = variantProps;

    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isControlled = !isNil(controlledIsOpen);
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

    const calc = useCalculatorLogic();

    const open = useCallback(() => {
        if (isControlled) {
            onOpenChange?.(true);
        } else {
            setInternalIsOpen(true);
        }
    }, [isControlled, onOpenChange]);

    const close = useCallback(() => {
        if (isControlled) {
            onOpenChange?.(false);
        } else {
            setInternalIsOpen(false);
        }
        onClose?.();
    }, [isControlled, onOpenChange, onClose]);

    const toggle = useCallback(() => {
        if (isOpen) close();
        else open();
    }, [isOpen, open, close]);

    const handleEquals = () => {
        const result = calc.performCalculation();
        if (result !== null) {
            onResult?.(result);
            if (closeOnResult) close();
        }
    };

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;

        if (e.key === "Escape") {
            close();
            return;
        }

        if (e.key >= "0" && e.key <= "9") calc.inputDigit(e.key);
        else if (e.key === ".") calc.inputDecimal();
        else if (e.key === "+") calc.handleOperator("+");
        else if (e.key === "-") calc.handleOperator("-");
        else if (e.key === "*") calc.handleOperator("×");
        else if (e.key === "/") { e.preventDefault(); calc.handleOperator("÷"); }
        else if (e.key === "Enter" || e.key === "=") handleEquals();
        else if (e.key === "Backspace") calc.backspace();
        else if (e.key === "Delete") calc.clearAll();
        else if (e.key === "%") calc.inputPercent();
    }, [isOpen, calc, close]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const positionClasses = {
        "bottom-right": "items-end justify-end pb-20",
        "bottom-left": "items-end justify-start pb-20",
        "bottom-center": "items-end justify-center pb-20",
        "center": "items-center justify-center",
        "top-right": "items-start justify-end pt-20",
        "top-left": "items-start justify-start pt-20",
    };

    const fabPositionClasses = {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
        "center": "bottom-4 right-4",
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
    };

    const formatDisplay = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        if (value.endsWith(".")) return value;
        if (value.includes(".") && value.endsWith("0")) return value;
        if (Math.abs(num) >= 1e12) return num.toExponential(6);
        return value;
    };

    return (
        <>
            {/* FAB Button */}
            {showFab && !isOpen && (
                <button
                    {...mergeProps("fab", (p) => ({
                        ...p,
                        onClick: toggle,
                        style: { "--z-index": zIndex - 1 },
                        className: `fixed z-(--z-index) w-14 h-14 bg-primary hover:bg-primary/90 text-primary-text rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 hover:shadow-xl ${fabPositionClasses[position]}`,
                        "aria-label": "Open calculator",
                    }))}
                >
                    <FabIcon className="text-app-lg" />
                </button>
            )}

            {/* Overlay */}
            {showOverlay && (
                <Overlay
                    {...mergeProps("Overlay", (p) => ({
                        zIndex: zIndex,
                        ...p,
                        isOpen,
                        close,
                        overlayProps: {
                            ...p.overlayProps,
                            className: "bg-black/30",
                        },
                    }))}
                />
            )}

            {/* Calculator Modal */}
            <div
                {...mergeProps("backdrop", (p) => ({
                    ...p,
                    style: { "--z-index": zIndex + 10 },
                    className: `fixed inset-0 z-(--z-index) flex p-4 pointer-events-none ${positionClasses[position]}`,
                }))}
            >
                <div
                    {...mergeProps("calculator", (p) => ({
                        ...p,
                        "data-component": "Calculator",
                        className: `
                            w-full max-w-xs bg-soft-bg rounded-app-lg shadow-xl overflow-hidden
                            duration-(--really-quick)
                            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                        `,
                    }))}
                >
                    {/* Header */}
                    <div
                        {...mergeProps("header", (p) => ({
                            ...p,
                            className: "flex items-center justify-between px-4 py-3 bg-soft-bg-alt border-b border-soft-border",
                        }))}
                    >
                        <h3 className="text-app-base font-app-semibold text-soft-text">
                            {title}
                        </h3>
                        <Button
                            {...mergeProps("Button", (p) => ({
                                icon: RiCloseLargeLine,
                                ...p,
                                onClick: close,
                                buttonProps: {
                                    ...p.buttonProps,
                                    className: "text-app-base text-soft-text-muted hover:text-soft-text p-1",
                                },
                            }))}
                        />
                    </div>

                    {/* Display */}
                    <div
                        {...mergeProps("display", (p) => ({
                            ...p,
                            className: "px-4 py-3 bg-gray-900 text-right",
                        }))}
                    >
                        <div className="text-gray-400 text-app-xs h-4 overflow-hidden">
                            {calc.expression}
                        </div>
                        <div className="text-white text-3xl font-light tracking-wide overflow-x-auto">
                            {formatDisplay(calc.display)}
                        </div>
                        {calc.memory !== 0 && (
                            <div className="text-gray-500 text-app-xs mt-1">M: {calc.memory}</div>
                        )}
                    </div>

                    {/* History */}
                    {showHistory && calc.history.length > 0 && (
                        <div
                            {...mergeProps("history", (p) => ({
                                ...p,
                                className: "px-4 py-2 bg-soft-bg-alt border-b border-soft-border max-h-20 overflow-y-auto",
                            }))}
                        >
                            <div className="text-app-xs text-soft-text-muted mb-1">History</div>
                            {calc.history.map((item, i) => (
                                <div key={i} className="text-app-xs text-soft-text truncate">
                                    {item.expression} = {item.result}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Memory buttons */}
                    {showMemory && (
                        <div
                            {...mergeProps("memoryButtons", (p) => ({
                                ...p,
                                className: "grid grid-cols-4 gap-1 p-2 bg-soft-bg-alt",
                            }))}
                        >
                            <CalcButton variant="memory" onClick={calc.memoryClear}>MC</CalcButton>
                            <CalcButton variant="memory" onClick={calc.memoryRecall}>MR</CalcButton>
                            <CalcButton variant="memory" onClick={calc.memoryAdd}>M+</CalcButton>
                            <CalcButton variant="memory" onClick={calc.memorySubtract}>M-</CalcButton>
                        </div>
                    )}

                    {/* Calculator buttons */}
                    <div
                        {...mergeProps("buttons", (p) => ({
                            ...p,
                            className: "grid grid-cols-4 gap-2 p-3",
                        }))}
                    >
                        <CalcButton variant="operator" onClick={calc.clearAll}>C</CalcButton>
                        <CalcButton variant="operator" onClick={calc.clearEntry}>CE</CalcButton>
                        <CalcButton variant="operator" onClick={calc.inputPercent}>%</CalcButton>
                        <CalcButton variant="operator" onClick={() => calc.handleOperator("÷")}>÷</CalcButton>

                        <CalcButton onClick={() => calc.inputDigit("7")}>7</CalcButton>
                        <CalcButton onClick={() => calc.inputDigit("8")}>8</CalcButton>
                        <CalcButton onClick={() => calc.inputDigit("9")}>9</CalcButton>
                        <CalcButton variant="operator" onClick={() => calc.handleOperator("×")}>×</CalcButton>

                        <CalcButton onClick={() => calc.inputDigit("4")}>4</CalcButton>
                        <CalcButton onClick={() => calc.inputDigit("5")}>5</CalcButton>
                        <CalcButton onClick={() => calc.inputDigit("6")}>6</CalcButton>
                        <CalcButton variant="operator" onClick={() => calc.handleOperator("-")}>-</CalcButton>

                        <CalcButton onClick={() => calc.inputDigit("1")}>1</CalcButton>
                        <CalcButton onClick={() => calc.inputDigit("2")}>2</CalcButton>
                        <CalcButton onClick={() => calc.inputDigit("3")}>3</CalcButton>
                        <CalcButton variant="operator" onClick={() => calc.handleOperator("+")}>+</CalcButton>

                        <CalcButton onClick={calc.toggleSign}>+/-</CalcButton>
                        <CalcButton onClick={() => calc.inputDigit("0")}>0</CalcButton>
                        <CalcButton onClick={calc.inputDecimal}>.</CalcButton>
                        <CalcButton variant="action" onClick={handleEquals}>=</CalcButton>
                    </div>

                    {/* Backspace */}
                    <div className="px-3 pb-3">
                        <CalcButton
                            className="w-full"
                            variant="operator"
                            onClick={calc.backspace}
                        >
                            <FaBackspace className="mr-2" />
                            Delete
                        </CalcButton>
                    </div>
                </div>
            </div>
        </>
    );
};

Calculator.propTypes = propTypes;
Calculator.defaultProps = defaultProps;

// Provider for global calculator control
export const CalculatorProvider = ({ children, ...calculatorProps }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [resultCallback, setResultCallback] = useState(null);

    const open = useCallback((onResult) => {
        if (onResult) setResultCallback(() => onResult);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setResultCallback(null);
    }, []);

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleResult = useCallback((result) => {
        resultCallback?.(result);
    }, [resultCallback]);

    const contextValue = {
        isOpen,
        open,
        close,
        toggle,
    };

    return (
        <CalculatorContext.Provider value={contextValue}>
            {children}
            <Calculator
                {...calculatorProps}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onResult={handleResult}
                onClose={close}
            />
        </CalculatorContext.Provider>
    );
};
