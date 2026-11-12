import { useContext } from "react";
import { isNil } from "lodash";
import { useVariantMerger } from "lib/hooks";
import { twMerge } from "lib/utils";
import { ViewportContext } from "lib/components/app/ViewportProvider/context";

import { defaultProps, propTypes } from "./props";

export const Block = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Block", props);

    const { 
        id,
        responsive = true,
        type,
        title,
        // Heading level of the title, so screen readers list the sections.
        titleAs: TitleTag = "h2",
        header,
        footer,
        className,
        children
    } = variantProps;

    // "title-bar": an horizontal action bar (back button, title, trailing
    // action) instead of the boxed content card. A top-level className used
    // to be dropped silently; it is merged here so the standard override
    // point works.
    const isTitleBar = type === "title-bar";

    // Desktop UI conventions: borders, no card shadow. The session viewport
    // decides (null-safe without a ViewportProvider, which keeps the
    // historical shadows), not a CSS breakpoint.
    const isDesktopSession = useContext(ViewportContext)?.isDesktop === true;

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            className: twMerge(`
                flex flex-col gap-app-xs
                ${!isTitleBar ? "my-app-base lg:my-0 lg:px-app-base lg:py-app-sm lg:bg-soft-bg lg:rounded-app-md" : ""}
                ${!isTitleBar && !isDesktopSession ? "lg:shadow-md" : ""}
            `, className)
        }))}>
            {title && 
                <TitleTag { ...mergeProps("title", props => ({
                    ...props,
                    className: `
                        font-app-semibold text-strong-text text-app-base mx-app-base
                        lg:mx-0
                    `
                }))}>
                    {title}
                </TitleTag>
            }
            {header && 
                <div { ...mergeProps("header", props => ({
                    ...props,
                    className: `text-soft-text text-app-sm mx-app-base`
                }))}>
                    {header}
                </div>
            }
            {children &&
                <div { ...mergeProps("block", props => ({
                    ...props,
                    className: isTitleBar
                        ? `flex flex-row items-center justify-between gap-app-base`
                        : `
                        flex flex-col gap-app-base bg-soft-bg px-app-base py-app-sm text-strong-text text-app-sm
                        ${isDesktopSession ? "" : "shadow-md lg:shadow-none"} lg:p-0
                    `
                }))}>
                    {children}
                </div>
            }
            {!isNil(footer) && 
                <div { ...mergeProps("footer", props => ({
                    ...props,
                    className: `text-soft-text text-app-sm mx-app-xxs`
                }))}>
                    {footer}
                </div>
            }
        </div>
    );
}

Block.propTypes = propTypes;
Block.defaultProps = defaultProps;