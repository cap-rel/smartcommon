import { useEffect } from "react";
import { secsToDuration } from "../../../../globals/functions";
import { Stepper, Label } from "../../../dol";
import { propTypes } from "./props";

export const Duration = ({
    label = null,
    id = null,
    help = null,
    min = 0,
    max = null,
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
    const labelProps = { id, label, required, help };
    const inputProps = { type: "int", required, disabled };

    const steppers = {
        days: { label: "Jour(s)", seconds: 3600 * 24 },
        hours: { label: "Heure(s)", seconds: 3600 },
        minutes: { label: "Minute(s)", seconds: 60 },
        seconds: { label: "Seconde(s)", seconds: 1 },
    };

    return (
        <Label { ...labelProps}>
            <div className={`col gap-4`}>
                {Object.entries(steppers).map(([key, stepper], NI) =>
                    <div key={NI} className={`row-v-center gap-4 h-full`}>
                        <Stepper
                            value={secsToDuration(value)[key]}
                            onChange={durationValue => onChange(value - secsToDuration(value)[key] * stepper.seconds + durationValue * stepper.seconds )}
                            min={0}
                            className={`h-full ${className}`}
                            { ...inputProps}
                        />
                        <span className={`italic`}>{stepper.label}</span>
                    </div>
                )}
            </div>
        </Label>
    )
};

Duration.propTypes = propTypes;