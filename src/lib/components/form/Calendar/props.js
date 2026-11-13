import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    yearsInterval: PropTypes.arrayOf(PropTypes.number),
    name: PropTypes.string,
    /** Selected date (yyyy-mm-dd) or interval ([start, end]). */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    onChange: PropTypes.func,
    /** Marked days, as yyyy-mm-dd strings: a day shows a badge counting
     * how many times its date appears. */
    items: PropTypes.arrayOf(PropTypes.string),
    onMonthChange: PropTypes.func,
    onYearChange: PropTypes.func,

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
    weekDayAndNumberContainerProps: PropTypes.object,
    weekDayProps: PropTypes.object,
    numberProps: PropTypes.object,
    badgeProps: PropTypes.object,
}