import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const PlainCalendar = setTestStory({
    args: {
        yearsInterval: [2020, 2030],
        interval: false,
    },
    props: propTypes,
    hidden: [
        "id", "value", "defaultValue", "onChange", "onMonthChange", "onYearChange",
        "labels",
        "containerProps", "upperContainerProps", "PreviousButton", "NextButton",
        "monthAndYearContainerProps", "monthProps", "monthSelectProps",
        "yearProps", "yearSelectProps",
        "lowerContainerProps", "weekDayProps", "weekDayAndNumberContainerProps",
        "numberProps", "badgeProps",
    ]
});
