import { Stepper, Label } from "../../dol";
import { propTypes } from "./props";

export const MultiNumber = ({
    label = null,
    id = null,
    help = null,
    type,
    min = 0,
    max = null,
    step = null,
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
    const labelProps = { id, label, required, help };
    const inputProps = { type: "reel", placeholder, min, max, step, required, disabled };

    return (
        <Label { ...labelProps}>
            <div className={`row-v-center gap-6`}>
                {value.map((number, NI) =>
                    <Stepper
                        value={number}
                        onChange={numberValue => {
                            const newValue = [...value];
                            newValue[NI] = numberValue;
                            onChange(newValue);
                        }}
                        className={`h-full ${className}`}
                        { ...inputProps}
                    />
                )}
            </div>
        </Label>
    )
};

MultiNumber.propTypes = propTypes;