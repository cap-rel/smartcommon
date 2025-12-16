import { setTestStory } from "../../../../../../storybook";
import { propTypes } from "../../props";

export const Gps = setTestStory({
    args: {
        label: "Location",
    },
    props: propTypes,
    hidden: ["onLocate", "containerProps", "labelContainerProps", "labelProps", "requiredStarProps", "helpProps", "inputContainerProps", "multipleGpsContainerProps", "gpsPointsContainerProps", "inputProps", "locationTypeIconProps", "latitudeProps", "longitudeProps", "deleteIconProps", "buttonContainerProps", "locationButtonProps", "locationButtonIconProps", "locationButtonSpinnerProps", "locationButtonLabelProps", "mapButtonProps", "mapButtonIconProps", "mapButtonSpinnerProps", "mapButtonLabelProps"]
});
