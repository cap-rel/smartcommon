import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    yearsInterval: PropTypes.arrayOf(PropTypes.number),
    name: PropTypes.string,
    /** Selected date (yyyy-mm-dd) or interval ([start, end]). */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    onChange: PropTypes.func,
    /** Marked days (e.g. { "yyyy-mm-dd": { color, label } }). */
    items: PropTypes.object,
    onMonthChange: PropTypes.func,
    onYearChange: PropTypes.func,

    containerProps: PropTypes.object,
    upperContainerProps: PropTypes.object,
    PreviousButton: PropTypes.object,
    NextButton: PropTypes.object,
    monthAndYearContainerProps: PropTypes.object,
    monthProps: PropTypes.object,
    yearProps: PropTypes.object,
    lowerContainerProps: PropTypes.object,
    dayAndWeekDayContainerProps: PropTypes.object,
    weekDayProps: PropTypes.object,
    dayProps: PropTypes.object,
}