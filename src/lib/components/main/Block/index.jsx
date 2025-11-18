import { isNil } from "lib/utils";
import { useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

export const Block = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Block", props);

    const { 
        id,
        responsive = true,
        title,
        header,
        footer,
        children
    } = variantProps;

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            className: `
                flex flex-col gap-app-xs my-app-base
                lg:my-0 lg:px-app-base lg:py-app-sm lg:bg-soft-bg lg:rounded-app-md lg:shadow-md
            `
        }))}>
            {title && 
                <div { ...mergeProps("title", props => ({
                    ...props,
                    className: `
                        font-app-semibold text-strong-text text-app-base mx-app-base
                        lg:mx-0
                    `
                }))}>
                    {title}
                </div>
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
                    className: `
                        flex flex-col gap-app-base bg-soft-bg px-app-base py-app-sm text-strong-text shadow-md text-app-sm
                        lg:shadow-none lg:p-0
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
Block.propTypes = defaultProps;