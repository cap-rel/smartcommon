import { useVariantMerger } from "lib/hooks";
import { secsToDuration } from "lib/utils";

import { propTypes } from "./props";

// TODO Intl DurationFormat

export const Duration = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Duration", props);

    const { value } = variantProps;

    // const formattedDuration = Intl.DurationFormat("fr-FR", { style: "short" }).format({ seconds: value });

    const { days, hours, minutes, seconds } = secsToDuration(value);

    const formattedDays = days !== 0 ? `${days} jour(s) ` : "";
    const formattedHours = (hours !== 0 || days !== 0) ? `${hours} h ` : "";
    const formattedMinutes = (minutes !== 0 || hours !== 0 || days !== 0) ? `${minutes} min ` : "";
    const formattedSeconds = (seconds !== 0 || minutes !== 0 || hours !== 0 || days !== 0) ? `${seconds} s` : "";

    const formattedDuration = `${formattedDays}${formattedHours}${formattedMinutes}${formattedSeconds}`;

    return (
        <div { ...mergeProps("duration", props => ({
            ...props,
            className: `italic`
        }))} >
            {formattedDuration}
        </div>
    );
};

Duration.propTypes = propTypes;