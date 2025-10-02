import PropTypes from "prop-types";

export const propTypes = {
    id: PropTypes.string,
    yearsInterval: PropTypes.arrayOf(PropTypes.number),
    value: PropTypes.string,
    onChange: PropTypes.func,

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