import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Calendar = setTestStory({
    args: {
        yearsInterval: [2020, 2030],
    },
    props: propTypes,
    hidden: ["id", "value", "onChange", "onMonthChange", "onYearChange", "containerProps", "upperContainerProps", "PreviousButton", "NextButton", "monthAndYearContainerProps", "monthProps", "yearProps", "lowerContainerProps", "dayAndWeekDayContainerProps", "weekDayProps", "dayProps"]
});
