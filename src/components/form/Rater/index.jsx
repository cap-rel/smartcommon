import { useLabel, useStates, useValue, useVariantToProps } from "../../../hooks";
import { Label } from "../tools/Label";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";
import { IoHeart, IoHeartHalf, IoHeartOutline } from "react-icons/io5";
import { FaFaceSmile, FaRegStar, FaRegStarHalfStroke, FaStar, FaThumbsUp } from "react-icons/fa6";
import { isNil } from "../../../globals/functions";
import { Icon } from "../tools";

// IDEA Add decimal rating system

// {
//     label,
//     labelRow = false,
//     help,
//     variant = "star", // heart, like, smile
//     maxRating = 5,
//     onValueChange = () => {},

//     containerProps,
//     labelContainerProps,
//     labelProps,
//     requiredStarProps,
//     helpProps,
//     inputProps,
//     ratingContainerProps,
//     iconProps,
//     ...props
// }

export const Rater = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Rater", props);
      
    const { extractedLabelProps, filteredProps } = useLabel(variantProps);
    
    const { 
        id,
        icon = FaStar,
        maxRating,
        name,
        defaultValue,
        value,
        onChange = () => {},
    } = filteredProps;

    const { currentValue, setValue } = useValue(defaultValue ?? null, value, onChange);

    // const VARIANT_ICONS_MAP = useMemo(() => ({
    //     star: { empty: FaRegStar, half: FaRegStarHalfStroke, full: FaStar },
    //     heart: { empty: IoHeartOutline, half: IoHeartHalf, full: IoHeart },
    //     like: { full: FaThumbsUp },
    //     smile: { full: FaFaceSmile }
    // }), []);

    const IconComponent = icon; 

    const updateRating = (index) => {
        const newValue = currentValue == Number(index) + 1  ? index : Number(index) + 1;
        setValue(newValue);
    };

    return (
        <Label 
            { ...extractedLabelProps}
            mergeProps={mergeProps}
        >
            <input
                name={name}
                onChange={() => {}}
                value={currentValue}
                hidden
            />
            <div { ...mergeProps("ratingContainer", props => ({
                ...props,
                className: `gap-app-xs flex items-center overflow-x-auto`
            }))}>
                {Array(maxRating).fill("").map((icon, II) =>
                    <Icon
                        key={`icon${II}`}
                        icon={<IconComponent />}
                        checked={II < currentValue}
                        onClick={() => updateRating(II)}
                    />
                )}
            </div>
        </Label>
    );
};

Rater.propTypes = propTypes;