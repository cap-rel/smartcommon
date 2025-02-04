import { useWindow } from "../../../hooks";
import { Label } from "../Label";
import { Icon } from "../../others";
import { propTypes } from "./props";

export const Rating = ({
    label = null,
    id = null,
    help = null,
    min = 0,
    max = null,
    variant = "star",
    divided = false,
    ratingMax = 5,
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
    const labelProps = { id, label, className, help, required };

    const { darkMode } = useWindow();

    const VARIANT_ICONS_MAP = {
        heart: { library: "io5", empty: "IoHeartOutline", half: "IoHeartHalf", full: "IoHeart" },
        star: { library: "fa6", empty: "FaRegStar", half: "FaRegStarHalfStroke", full: "FaStar" },
    }

    const variantIcons = VARIANT_ICONS_MAP[variant];

    const intValue = Math.floor(value);
    // const isDivided = value % 1 !== 0;

    return (
        <Label { ...labelProps}>
            <div className={`row-v-center gap-2`}>
                {Array(max || 5).fill("").map((step, SI) =>
                    <Icon
                        library={variantIcons.library}
                        icon={
                              intValue >= SI + 1
                            ? variantIcons.full
                            // : (isDivided && value < SI + 1) 
                            // ? variantIcons.half
                            : variantIcons.empty
                        }
                        className={`
                            text-2xl flex-shrink-0
                            ${(!color) && "text-primary"}
                            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                        `}
                        style={{ color: color }}
                        onClick={() => !disabled && onChange(SI + 1)}
                    />
                )}
            </div>
            
            {/* {disabledFilter && <div className={`absolute inset-0 z-10 bg-black-10 dark:bg-white-10 rounded-full`}/>} */}
        </Label>
    );
};

Rating.propTypes = propTypes;