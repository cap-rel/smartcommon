import { useWindow } from "../../../hooks";
import { Icon } from "../../others";
import { propTypes } from "./props";

export const Boolean = ({
    label = null,
    id = null,
    help = null,
    variant = "switch",
    readOnly = false,
    required = false,
    disabled = false,
    value,
    onChange = () => {},
    color = null,
    className = null
}) => {
    const { darkMode } = useWindow();

    return (
        <div className={`row-v-center gap-4 ${className}`}>
            {variant === "check" ?
                <div
                    onClick={() => !disabled && onChange(!value)}
                    className={`
                        relative border-2 duration-100 w-6 h-6 rounded-md flex-shrink-0
                        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                        ${value ? (!color && "bg-primary dark:bg-primary-20 border-primary") : "border-dol bg-soft-dol"}
                    `}
                    style={{ 
                        backgroundColor: (color && value) && color,
                        borderColor: (color && value) && color
                    }}
                    >
                    <Icon
                        library="fa"
                        icon="FaCheck"
                        className={`
                        w-3 h-3 text-white dark:text-primary 
                        ${value ? "absolute-full-center opacity-100 duration-100" : "opacity-0 absolute-h-center bottom-0"}
                        `}
                    />
                </div>
            : variant === "star" ?
                <Icon
                    library={`fa6`}
                    icon={value ? "FaStar" : "FaRegStar"}
                    className={`
                        text-2xl flex-shrink-0
                        ${(!color) && "text-primary"}
                        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                    style={{ color: color }}
                    onClick={() => !disabled && onChange(!value)}
                />
            : variant === "heart" ?
                <Icon
                    library={`io5`}
                    icon={value ? "IoHeart" : "IoHeartOutline"}
                    className={`
                        text-2xl flex-shrink-0
                        ${(!color) && "text-primary"}
                        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    `}
                    style={{ color: color }}
                    onClick={() => !disabled && onChange(!value)}
                />
            :
                <div
                    onClick={() => !disabled && onChange(!value)}
                    className={`
                        row-v-center rounded-full w-10 h-6 duration-200 border-2
                        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                        ${value ? `${!color && "bg-primary dark:bg-primary-10 border-primary"}` : "border-dol bg-light-soft dark:bg-transparent"}
                    `}
                    style={{ 
                        backgroundColor: (value && color) && (darkMode ? color : color), // opacity 2
                        borderColor: (value && color) && color
                    }}
                >
                    <div 
                        className={`
                            rounded-full w-4 h-4 ml-1 duration-200
                            ${value ? `translate-x-full bg-white ${!color && "dark:bg-primary"}` : "bg-light dark:bg-dark-soft"}
                        `}
                        style={{ backgroundColor: (value && color && darkMode) && color}}
                    />
                </div>
            }
            {label && <label onClick={() => !disabled && onChange(!value)} className={`${value ? "text-dol" : "text-soft-dol"} duration-100`}>{label}</label>}
        </div>
    );
};

Boolean.propTypes = propTypes;