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
            className={`px-1 text-smt h-full col-full-center flex-1 gap-1 bg-smt group`}
        >
            {!isEmpty(icon) && 
                <div className={
                    `py-2 w-3/4 rounded-full child
                    ${isActive ? "bg-primary/15 duration-100" : "bg-smt group-active:brightness-90"}
                `}>
                    <Icon
                        library={isActive ? (!isEmpty(activeIcon) ? activeIcon.library : icon.library): icon.library}
                        name={isActive ? (!isEmpty(activeIcon) ? activeIcon.name : icon.name) : icon.name}
                        className={`
                            text-xl mx-auto duration-100 flex-shrink-0
                            ${isActive ? "text-primary" : "text-soft-smt"}
                        `}
                    />
                </div>
            }
            {!isEmpty(label) &&
                <div className={`
                    truncate text-xs duration-100
                    ${isActive ? "text-primary" : "text-soft-smt"}
                `}>
                    {label}
                </div>
            }
        </Link>
    );
};
