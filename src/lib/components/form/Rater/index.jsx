import { useLabel, useStates, useValue, useVariantMerger } from "../../../hooks";
import { Label } from "../tools/Label";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { useEffect, useMemo } from "react";
import { IoHeart, IoHeartHalf, IoHeartOutline } from "react-icons/io5";
import { FaFaceSmile, FaRegStar, FaRegStarHalfStroke, FaStar, FaThumbsUp } from "react-icons/fa6";
import { isEmpty, isNil } from "../../../utils/functions";
import { Icon } from "../tools";

// IDEA Add decimal rating system

export const Rater = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Rater", props);
          
    const { 
        id,
        name,
        defaultValue,
        value,
        onChange = () => {},

        required,
        disabled,
        readOnly,

        min,
        max,

        ratingIcon = <FaStar />,
        ratingMax = 5,

        onError = () => {}
    } = variantProps;

    const { currentValue, setValue } = useValue(defaultValue ?? null, value, onChange);

    const updateRating = (index) => {
        if (!disabled && !readOnly) {
            const newValue = currentValue == Number(index) + 1  ? index : Number(index) + 1;
            setValue(newValue);
        }
    };

    const errors = {
        required: { 
            condition: required && isEmpty(currentValue),
            message: "Ce champ est requis."
        },
        min: {
            condition: !isNil(min) && currentValue < min,
            message: `La notation doit être de ${min} au minimum.`
        },
        max: { 
            condition: !isNil(max) && currentValue > max,
            message: `La notation doit être de ${max} au minimum.`
        },
    };

    useEffect(() => {
        Object.entries(errors).forEach(([errorKey, error]) => onError(`${id}-${errorKey}`, error.condition))
    }, [currentValue]);

    return (
        <Label 
            { ...variantProps}
            errors={errors}
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
                {Array(ratingMax).fill("").map((icon, II) =>
                    <Icon
                        key={`icon${II}`}
                        mergeProps={mergeProps}
                        icon={ratingIcon}
                        checked={II < currentValue}
                        onClick={() => updateRating(II)}
                        disabled={disabled}
                    />
                )}
            </div>
        </Label>
    );
};

Rater.propTypes = propTypes;