import { twMerge } from "tailwind-merge";
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
                    <label 
                        htmlFor={id}
                        { ...labelPs}
                        className={twMerge(`font-semibold ml-0.5`, labelPs?.className)}
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