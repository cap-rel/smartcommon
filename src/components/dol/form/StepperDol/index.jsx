import { useMemo } from "react";
import { IconDol, LabelDol, SelectDol } from "../../../dol";
import { useStates } from "../../../hooks";
import { isNull, isUndefined } from "../../../../globals/functions";
import { propTypes } from "./props";

const StepperDol = ({
    label = null,
    id = null,
    help = null,
    placeholder = null,
    type,
    min,
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

    const DEFAULT_STEPPER_PROPS_MAP = useMemo(() => ({
        int   : { min: -Number.MAX_SAFE_INTEGER },
        reel  : { min: -Number.MAX_VALUE        },
        stock : { min: 0                        },
        price : { min: 0                        },
        pricey: { min: 0                        },
    }), []);

    const defaultProps = DEFAULT_STEPPER_PROPS_MAP[type];

    const filteredMin = isUndefined(min)  ? defaultProps.min : min;

    const labelProps = { id, label, required, help, className };
    const inputProps = { type: "number", id, placeholder, min: filteredMin, max, required, disabled };

    const devises = [{ label: "€", value: "euro" }, { label: "$", value: "dollar"}, { label: "£", value: "pound" }];

    const { states, set } = useStates({
        devise: type === "pricey" ? value[1] : null,
    })

    return (
        <LabelDol { ...labelProps}>
            <div className={`row-v-center gap-4 h-full`}>
                <div className={`row-v-center rounded-md relative flex-grow h-full`}>
                    {disabled && <div className={`absolute inset-0 z-10 bg-black-10 dark:bg-white-10 rounded-md`} />}          

                    {!isNull(step) &&
                        <button 
                            onClick={() => value > finalMin && onChange(parseFloat(value - step))}
                            className={`button-dol p-2 border border-primary bg-primary dark:bg-primary-20 text-white dark:text-primary outline-none rounded-l-lg h-full`}
                        >
                        <IconDol library={`fa`} icon={`FaMinus`}/>
                        </button>
                    }

                    
                    <input
                        value={value}
                        onChange={e => !disabled && onChange(e.target.value)}
                        className={`
                            p-2 truncate outline-none placeholder-dol bg-dol dark:bg-dark-soft flex-grow border-dol focus:ring-1 ring-primary focus:border-primary w-full
                            ${!isNull(step) ? "border-y" : "border rounded-md"}
                        `}
                            // ${!step && ((type === "price" || type === "pricey") ? "rounded-l-md" : "rounded-r-md")}
                        { ...inputProps}
                    />

                    {!isNull(step) &&
                        <button 
                            onClick={() => value < finalMax && onChange(parseFloat(value + step))}
                            className={`button-dol p-2 border border-primary bg-primary dark:bg-primary-20 text-white dark:text-primary accent-primary rounded-r-lg h-full`}
                        >
                        <IconDol library={`fa6`} icon={`FaPlus`}/>
                        </button>
                    }
                </div>
                    {type === "pricey" &&
                        <SelectDol
                            value={states.devise}
                            onChange={value => set("devise", value)}
                            placeholder={""}
                            options={devises}
                        />
                    }

                    {type === "price" && <span className={``}>€</span>}
                </div>
        </LabelDol>
    );  
};

StepperDol.propTypes = propTypes

export default StepperDol;
