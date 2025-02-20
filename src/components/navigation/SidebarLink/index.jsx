import { useLocation } from "react-router-dom";
import { isEmpty } from "../../../globals/functions";
import { Button, Icon, LazyLink } from "../../others";

export const SidebarLink = ({
    to = null,
    icon = null,
    activeIcon = null,
    label = null,
    variant = "",
    customType = null,
    custom = {
        color: null,
        classNames: null
    },
    ...props
}) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    const filteredIcon = (isActive && !isEmpty(activeIcon)) ? activeIcon : icon

    return (
        <LazyLink
            to={to}
            // onClick={() => set("isOpened", false)}
            duration={300}
            className={`gap-1 px-6 py-3 duration-200 col-full-center bg-strong button-smt max-w-40`}
            { ...props}
        >
            {!isEmpty(icon) && 
                <Button
                    leftIcon={{
                        library: icon.library,
                        name: icon.name
                    }}
                    variant={{
                        classNames: {
                            button: "p-4 active:brightness-100",
                            leftIcon: "flex-shrink-0 text-3xl"
                        }
                    }}
                />
            }
            {!isEmpty(label) &&
                <div className={`text-sm font-semibold truncate text-soft-text`}>
                    {label}
                </div>
            }
        </LazyLink>
    );
};