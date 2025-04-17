import { useVariantToProps } from "../../../hooks";
import { Button, LazyLink } from "../../others";
import { propTypes } from "./props";

export const NavbarUpperLink = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("navbarUpperLink", props);

    return (
        <LazyLink { ...mergeProps("LazyLink", props => props)}>
            <Button { ...mergeProps("Button", props => ({
                ...props,
                buttonProps: {
                    ...props.buttonProps,
                    className: "px-app-xs py-app-xs text-app-lg"
                }
            }))} />
        </LazyLink>
    );
};

NavbarUpperLink.propTypes = propTypes;