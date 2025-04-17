import { useLocation } from "react-router-dom";
import { isNil } from "../../../globals";
import { useVariantToProps } from "../../../hooks";
import { Button, LazyLink } from "../../others";
import { propTypes } from "./props";

export const NavbarBottomLink = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("navbarBottomLink", props);

    const { isActive } = variantProps;

    const { Link = {} } = variantProps.LazyLink || {};

    const { to } = Link;

    const location = useLocation();

    const isLinkActive = isActive || (!isNil(to) && `${location.pathname}${location.search}` === to)

    return (
        <LazyLink { ...mergeProps("LazyLink", props => props)}>
            <Button { ...mergeProps("Button", props => ({
                ...props,
                buttonProps: {
                    ...props.buttonProps,
                    style: { transition: `filter var(--quick), color var(--medium), border-color var(--medium)` },
                    className: `snap-center border-b-4 px-app-base py-app-xs rounded-none rounded-b-app-base font-app-base gap-app-sm ${isLinkActive ? "text-white border-white" : "text-white/50 border-primary"}`
                }
            }))} />
        </LazyLink>
    );
};

NavbarBottomLink.propTypes = propTypes;

