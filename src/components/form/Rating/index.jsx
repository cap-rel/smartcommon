import { useStates } from "../../../hooks";
import { Label } from "../Label";
import { propTypes } from "./props";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";
import { IoHeart, IoHeartHalf, IoHeartOutline } from "react-icons/io5";
import { FaFaceSmile, FaRegStar, FaRegStarHalfStroke, FaStar, FaThumbsUp } from "react-icons/fa6";
import { isNil } from "../../../globals/functions";
import { CheckedIcon } from "../tools";

// IDEA Add decimal rating system

export const Rating = ({
    label,
    labelRow = false,
    help,
    variant = "star", // heart, like, smile
    maxRating = 5,
    onValueChange = () => {},

    containerProps,
    labelContainerProps,
    labelProps,
    requiredStarProps,
    helpProps,
    inputProps,
    ratingContainerProps,
    iconProps,
    ...props
}) => {
    const inputPs = { ...props, ...inputProps };

    const { required, readOnly, disabled, id, value, defaultValue } = inputPs;

    if (labelRow) {
        containerProps = { ...containerProps, className: twMerge(`row-between-center bg-strong border border-soft-border p-2 rounded-md`, containerProps?.className) };
        labelProps = { ...labelProps, className: twMerge(`truncate`, labelProps?.className) };
    }

    const inputPsForLabel = { required, readOnly, disabled, id };
    const allLabelPs = { label, labelRow, help, containerProps, labelProps, requiredStarProps, helpProps, ...inputPsForLabel };

    const { states, set } = useStates({
        localValue: defaultValue ?? ""
    });

    const { localValue } = states;

    const realValue = value ?? localValue;

    const VARIANT_ICONS_MAP = useMemo(() => ({
        star: { empty: FaRegStar, half: FaRegStarHalfStroke, full: FaStar },
        heart: { empty: IoHeartOutline, half: IoHeartHalf, full: IoHeart },
        like: { full: FaThumbsUp },
        smile: { full: FaFaceSmile }
    }), []);

    const Icon = VARIANT_ICONS_MAP[variant].full;

    const handleOnClick = (index) => {
        const newValue = realValue == Number(index) + 1  ? index : Number(index) + 1;
        if (isNil(value)) {
            set("localValue", newValue);
        } else {
            onValueChange(newValue);
        }
    };

    return (
        <Label { ...allLabelPs}>
            <input
                { ...inputPs}
                onChange={() => {}}
                value={realValue}
                className={twMerge(`hidden`, inputPs?.className)}
            />
            <div 
                { ...ratingContainerProps}
                className={twMerge(`gap-2 row-v-center overflow-x-auto`, ratingContainerProps?.className)}
            >
                {Array(maxRating).fill("").map((step, SI) =>
                    <CheckedIcon
                        key={`icon${SI}`}
                        { ...iconProps}
                        icon={<Icon />}
                        checked={SI < realValue}
                        onClick={() => handleOnClick(SI)}
                    />
                )}
            </div>
        </Label>
    );
};

Rating.propTypes = propTypes;