import { isValidElement, createElement } from "react";
import { FaCheck, FaExclamation } from "react-icons/fa6";
import { isFunction, isNil } from "lodash";

import { useVariantMerger } from "lib/hooks";

import { propTypes, defaultProps, DEFAULT_LABELS } from "./props";

// Derive the visual status of a step from either its explicit `status` field
// or the active `currentStep` index. Index-based derivation: lower indices are
// completed, the matching index is current, higher indices are upcoming.
const deriveStatus = (step, index, currentStep) => {
    if (!isNil(step?.status)) {
        return step.status;
    }
    if (index < currentStep) {
        return "completed";
    }
    if (index === currentStep) {
        return "current";
    }
    return "upcoming";
};

// Render the user-provided icon. Accept either a React element (e.g.
// <FaStar />) or a component reference (e.g. FaStar) to mirror the pattern
// used elsewhere in the library (IconDisplay).
const renderUserIcon = (icon) => {
    if (isNil(icon)) {
        return null;
    }
    if (isValidElement(icon)) {
        return icon;
    }
    if (isFunction(icon)) {
        return createElement(icon);
    }
    return icon;
};

// Classes by status for the indicator badge.
const indicatorClassesByStatus = {
    completed: "bg-primary text-white border border-primary",
    current: "bg-white text-primary border-2 border-primary",
    upcoming: "bg-strong text-soft-text border border-soft-border",
    error: "bg-red-600 text-white border border-red-600",
};

// Classes by status for the connector line. A connector visually links the
// previous step to the current one - we colour it based on the *destination*
// step's status (completed/current after a completed = filled, error = red).
const connectorClassesByStatus = {
    completed: "bg-primary",
    current: "bg-primary",
    upcoming: "bg-soft-border",
    error: "bg-red-600",
};

export const Stepper = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Stepper", props);

    const {
        steps = [],
        currentStep = 0,
        orientation = "horizontal",
        onStepClick,
        labels = {},
    } = variantProps;

    const isVertical = orientation === "vertical";
    const clickable = isFunction(onStepClick);

    const stepN = labels.stepN || DEFAULT_LABELS.stepN;

    return (
        <div {...mergeProps("container", (p) => ({
            ...p,
            "data-component": "Stepper",
            "data-orientation": orientation,
            className: `flex ${isVertical ? "flex-col" : "flex-row items-start"} w-full ${isVertical ? "gap-app-sm" : "gap-app-xs"}`,
        }))}>
            {steps.map((step, index) => {
                const status = deriveStatus(step, index, currentStep);
                const isLast = index === steps.length - 1;

                // Indicator content: completed -> check, error -> exclamation,
                // otherwise user-provided icon if any, else step number (1-based).
                let indicatorContent;
                if (status === "completed") {
                    indicatorContent = <FaCheck aria-hidden="true" />;
                } else if (status === "error") {
                    indicatorContent = <FaExclamation aria-hidden="true" />;
                } else if (!isNil(step.icon)) {
                    indicatorContent = renderUserIcon(step.icon);
                } else {
                    indicatorContent = <span>{index + 1}</span>;
                }

                const indicatorClass = indicatorClassesByStatus[status] || indicatorClassesByStatus.upcoming;

                const connectorClass = connectorClassesByStatus[status] || connectorClassesByStatus.upcoming;

                const stepAriaLabel = stepN(index + 1);

                const handleClick = clickable ? () => onStepClick(step, index) : undefined;

                const handleKeyDown = clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onStepClick(step, index);
                        }
                    }
                    : undefined;

                return (
                    <div
                        key={`step-${index}`}
                        {...mergeProps("step", (p) => ({
                            ...p,
                            "data-status": status,
                            "data-step-index": index,
                            role: clickable ? "button" : undefined,
                            tabIndex: clickable ? 0 : undefined,
                            "aria-current": status === "current" ? "step" : undefined,
                            "aria-label": stepAriaLabel,
                            onClick: handleClick,
                            onKeyDown: handleKeyDown,
                            className: `flex ${isVertical ? "flex-row items-start gap-app-sm" : "flex-col items-center"} ${isVertical ? "" : "flex-1 min-w-0"} ${clickable ? "cursor-pointer" : ""}`,
                        }))}
                    >
                        {/* Indicator + (vertical) connector column wrapper.
                            In vertical layout the connector lives directly below
                            the badge so the line follows the indicator column. */}
                        <div className={`flex ${isVertical ? "flex-col items-center self-stretch" : "flex-row items-center w-full"}`}>
                            <div {...mergeProps("stepIndicator", (p) => ({
                                ...p,
                                className: `flex items-center justify-center rounded-full w-8 h-8 text-app-sm font-semibold shrink-0 ${indicatorClass}`,
                            }))}>
                                <span {...mergeProps("stepIcon", (p) => ({
                                    ...p,
                                    className: `flex items-center justify-center`,
                                }))}>
                                    {indicatorContent}
                                </span>
                            </div>

                            {/* Horizontal connector lives next to the badge on
                                the same row, vertical connector lives in the
                                indicator column under the badge. */}
                            {!isLast && (
                                <div {...mergeProps("stepConnector", (p) => ({
                                    ...p,
                                    "data-connector": "true",
                                    className: isVertical
                                        ? `w-px flex-1 min-h-6 ${connectorClassesByStatus[deriveStatus(steps[index + 1], index + 1, currentStep)] || connectorClass}`
                                        : `flex-1 h-px mx-app-xs ${connectorClassesByStatus[deriveStatus(steps[index + 1], index + 1, currentStep)] || connectorClass}`,
                                }))} />
                            )}
                        </div>

                        {/* Label + description block. In horizontal layout it
                            sits below the indicator; in vertical layout, next to it. */}
                        <div className={`flex flex-col ${isVertical ? "pb-app-sm" : "items-center mt-app-xxs text-center"} min-w-0`}>
                            {!isNil(step.label) && (
                                <div {...mergeProps("stepLabel", (p) => ({
                                    ...p,
                                    className: `text-app-sm ${status === "current" ? "text-strong-text font-semibold" : status === "error" ? "text-red-600 font-semibold" : status === "completed" ? "text-strong-text" : "text-soft-text"} truncate`,
                                }))}>
                                    {step.label}
                                </div>
                            )}
                            {!isNil(step.description) && (
                                <div {...mergeProps("stepDescription", (p) => ({
                                    ...p,
                                    className: `text-app-xs text-soft-text truncate`,
                                }))}>
                                    {step.description}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

Stepper.propTypes = propTypes;
Stepper.defaultProps = defaultProps;
