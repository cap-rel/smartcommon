/**
 * Pure arithmetic for the Calculator. Extracted from the component so the
 * financially-sensitive maths (operators, percent semantics, division by zero)
 * is unit-tested independently of the React UI.
 */

/**
 * Apply a binary operator. Division by zero yields 0 (deliberate: the
 * calculator never surfaces Infinity/NaN to the user).
 *
 * @param {number} left
 * @param {number} right
 * @param {string} op - one of "+", "-", "×", "÷"
 * @returns {number}
 */
export const calculate = (left, right, op) => {
    switch (op) {
        case "+": return left + right;
        case "-": return left - right;
        case "×": return left * right;
        case "÷": return right !== 0 ? left / right : 0;
        default: return right;
    }
};

/**
 * Percent semantics aware of a pending operation:
 *   - "+" / "-": `current` is a percentage OF the accumulator, so it resolves
 *     to previousValue * current/100 (e.g. 50 + 10% -> 5, then = -> 55).
 *   - "×" / "÷": the plain fraction current/100 (e.g. 50 × 10% -> 50 × 0.1).
 *   - no pending operator: the unary "divide by 100".
 *
 * @param {number} current - the value currently on the display
 * @param {number|null} previousValue - the pending left operand, or null
 * @param {string|null} operator - the pending operator, or null
 * @returns {number}
 */
export const computePercent = (current, previousValue, operator) => {
    if (previousValue !== null && previousValue !== undefined && operator) {
        if (operator === "+" || operator === "-") {
            return previousValue * (current / 100);
        }
        return current / 100;
    }
    return current / 100;
};
