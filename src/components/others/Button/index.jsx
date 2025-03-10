import { twMerge } from "tailwind-merge";
import { isEmpty } from "../../../globals/functions";
import { propTypes } from "./props";

export const Button = ({
    left,
    right,
    floatingPosition = "bottom-right",

    buttonProps,
    leftProps,
    rightProps,
    ...props
}) => {

    const buttonPs = { ...props, ...buttonProps };
    const { disabled, children } = buttonPs;

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
        }
    }
    return (
        <button
            { ...buttonPs}
            className={twMerge(`row-v-center gap-2 cursor-pointer p-2 bg-primary text-white rounded-md text-base duration-100  ${disabled ? "brightness-soft" : "active:brightness-soft"} ${floatingPositionClass()}`, buttonPs?.className)}
        >
            {!isEmpty(left) &&
                <div className={twMerge(`text-xl`, leftProps?.className)}>
                    {left}
                </div>
            }
            {children}
            {!isEmpty(right) &&
                <div className={twMerge(`text-xl`, rightProps?.className)}>
                    {right}
                </div>
            }
        </button>
    );
};

Button.propTypes = propTypes