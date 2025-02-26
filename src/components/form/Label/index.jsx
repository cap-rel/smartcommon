import { twMerge } from "tailwind-merge";
import { Icon } from "../../others";
import { propTypes } from "./props";
import { isEmpty } from "../../../globals/functions";

// IDEA Mini-popup for help

// TODO help

export const Label = ({
    id,
    label, 
    help,
    required,
    readOnly,
    disabled,
    labelRow = false,
    children,

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    ...props
}) => {

    const labelPs = { ...props, ...labelProps };

    return (
        <div 
            { ...containerProps}
            className={twMerge(`${labelRow ? "row-v-center" : "col"} gap-2`, containerProps?.className)}
        >
            {!isEmpty(label) && 
                <div 
                    { ...labelContainerProps}
                    className={twMerge(`gap-2 row-v-center`, labelContainerProps?.className)}
                >
                    {/* {note && <Icon library={`fa`} name={`FaCircle`} className={`text-[8px] text-note`} />} */}
                    <label 
                        htmlFor={id}
                        { ...labelPs}
                        className={twMerge(`font-semibold`, labelPs?.className)}
                    >
                        {label}
                    </label>
                    {required && 
                        <div 
                            { ...requiredStarProps}
                            className={twMerge(`text-red-500`, requiredStarProps?.className)}
                        >
                            *
                        </div>
                    }
                    {/* {help && <Help content={help} />} */}
                </div>
            }
            {children}
        </div>
    );
}

Label.propTypes = propTypes;