import { filter, isEmpty, isNil } from "lodash";

// Single source for which error messages Label shows under a field and which
// ids they carry, so the control (input, textarea, select) can point at them
// with aria-describedby. Label and the control both call it with the same
// arguments, which keeps the ids in step.
//
// - `error`: consumer-provided message, always shown, id `${id}-error`.
// - `errors`: rule objects ({ condition, message }) from useField, shown once
//   the form has been submitted, ids `${id}-error-0`, `${id}-error-1`...
export const getFieldErrors = ({ id, showErrors, errors = {}, error } = {}) => {
    const failingErrors = showErrors ? filter(errors, { condition: true }) : [];
    const hasConsumerError = !isNil(error);
    const hasError = hasConsumerError || !isEmpty(failingErrors);

    const consumerErrorId = isNil(id) ? undefined : `${id}-error`;
    const ruleErrorId = (index) => (isNil(id) ? undefined : `${id}-error-${index}`);

    const errorIds = isNil(id)
        ? []
        : [
            ...(hasConsumerError ? [consumerErrorId] : []),
            ...failingErrors.map((_, index) => ruleErrorId(index)),
        ];

    return { failingErrors, hasError, consumerErrorId, ruleErrorId, errorIds };
};

// ARIA attributes for the control: invalid while an error shows, described by
// the visible messages. `ownProps` are the props the control already carries
// (consumer slot and forwarded attributes): their aria-describedby is kept in
// front of the error ids, and an explicit aria-invalid wins. Spread the result
// after those props.
export const getFieldErrorAria = (args, ownProps = {}) => {
    const { hasError, errorIds } = getFieldErrors(args);
    const describedBy = [ownProps["aria-describedby"], ...errorIds].filter(Boolean).join(" ");
    return {
        "aria-invalid": ownProps["aria-invalid"] ?? (hasError ? true : undefined),
        "aria-describedby": describedBy || undefined,
    };
};
