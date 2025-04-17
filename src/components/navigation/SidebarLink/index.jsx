import { Button, LazyLink } from "../../others";
import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";

export const SidebarLink = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("sidebarLink", props);

    const { closeSidebar } = variantProps;

    return (
        <LazyLink { ...mergeProps("LazyLink", props => ({
            ...props,
            Link: {
                ...props.Link,
                onClick: closeSidebar,
            }
        }))}>
            <Button { ...mergeProps("Button", props => ({
                ...props,
                buttonProps: { 
                    ...props.buttonProps,
                    className: `gap-app-xxs w-full flex-col justify-center bg-soft-bg rounded-app-base`
                },
                iconProps: {
                    ...props.iconProps,
                    className: `bg-primary rounded-app-md p-app-base text-3xl`
                },
                textProps: { 
                    ...props.textProps,
                    className: `text-app-sm text-soft-text`
                }
            }))} />
        </LazyLink>
    );
};

SidebarLink.propTypes = propTypes;