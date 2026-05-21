import PropTypes from "prop-types";

export const DEFAULT_LABELS = {
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export const propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    yearsInterval: PropTypes.arrayOf(PropTypes.number),
    interval: PropTypes.bool,
    items: PropTypes.array,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    onChange: PropTypes.func,
    onMonthChange: PropTypes.func,
    onYearChange: PropTypes.func,
    labels: PropTypes.shape({
        weekdays: PropTypes.arrayOf(PropTypes.string),
    }),

    containerProps: PropTypes.object,
    upperContainerProps: PropTypes.object,
    PreviousButton: PropTypes.object,
    NextButton: PropTypes.object,
    monthAndYearContainerProps: PropTypes.object,
    monthProps: PropTypes.object,
    monthSelectProps: PropTypes.object,
    yearProps: PropTypes.object,
    yearSelectProps: PropTypes.object,
    lowerContainerProps: PropTypes.object,
    weekDayProps: PropTypes.object,
    weekDayAndNumberContainerProps: PropTypes.object,
    numberProps: PropTypes.object,
    badgeProps: PropTypes.object,
};
