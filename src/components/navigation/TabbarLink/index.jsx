import { Link, useLocation } from "react-router-dom";
import { Icon } from "../../others";
import { useNavigator } from "../../../hooks";
import { isEmpty } from "../../../globals/functions";

export const TabbarLink = ({
    to = null,
    icon = null,
    activeIcon = null,
    label = null,
    variant = "",
    customType = null,
    custom = {
        color: null,
        classNames: null
    }
}) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex-1 gap-1 px-1 h-full text-strong col-full-center bg-strong group`}
        >
            {!isEmpty(icon) && 
                <div className={
                    `py-2 w-3/4 rounded-full child
                    ${isActive ? "duration-100 bg-primary/15" : "bg-strong group-active:brightness-90"}
                `}>
                    <Icon
                        library={isActive ? (!isEmpty(activeIcon) ? activeIcon.library : icon.library): icon.library}
                        name={isActive ? (!isEmpty(activeIcon) ? activeIcon.name : icon.name) : icon.name}
                        className={`
                            text-xl mx-auto duration-100 flex-shrink-0
                            ${isActive ? "text-primary" : "text-soft-text"}
                        `}
                    />
                </div>
            }
            {!isEmpty(label) &&
                <div className={`
                    truncate text-xs duration-100
                    ${isActive ? "text-primary" : "text-soft-text"}
                `}>
                    {label}
                </div>
            }
        </Link>
    );
};
