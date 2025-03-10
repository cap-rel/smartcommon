import { twMerge } from "tailwind-merge";
import { isEmpty } from "../../../globals/functions";

export const Button = ({
    leftIcon = null,
    rightIcon = null,
    floatingPosition = null,
    variant = {
        classNames: {
            leftIcon: null,
            rightIcon: null,
            button: null
        }
    },
    children = null,
    ...props
}) => {
    const { classNames } = variant;

    const floatingPositionClass = () => {
        switch (floatingPosition) {
            case "top-left": return "";
            case "top": return "";
            case "top-right": return "";
            case "right": return "";
            case "bottom-right": return "";
            case "bottom": return "";
            case "bottom-left": return "";
            case "left": return "";
            case "center": return "";
            default: return "";
        }
    }
    return (
        <button
            className={twMerge(`row-v-center gap-2 cursor-pointer p-2 bg-primary text-white button-smt rounded-md text-base ${floatingPositionClass()}`, classNames.button)}
            { ...props}
        >
            {!isEmpty(leftIcon) &&
                <Icon
                    library={leftIcon.library}
                    name={leftIcon.name}
                    className={twMerge("text-xl", classNames.leftIcon)}
                />
            }
            {children}
            {!isEmpty(rightIcon) &&
                <Icon
                    library={rightIcon.library}
                    name={rightIcon.name}
                    className={twMerge("text-xl", classNames.rightIcon)}
                />
            }
        </button>
    );
};