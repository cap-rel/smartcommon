import { isNil } from "../../../utils/functions";
import { propTypes } from "./props";
import { useVariantMerger } from "../../../hooks";

export const Block = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Block", props);

    const { id, title, header, footer, children } = variantProps;

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            className: `flex flex-col gap-app-xs my-app-base`
        }))}>
            {!isNil(title) && 
                <div { ...mergeProps("title", props => ({
                    ...props,
                    className: `font-app-semibold text-strong-text text-app-base mx-app-base`
                }))}>
                    {title}
                </div>
            }
            {!isNil(header) && 
                <div { ...mergeProps("header", props => ({
                    ...props,
                    className: `text-soft-text text-app-sm mx-app-base`
                }))}>
                    {header}
                </div>
            }
            {!isNil(children) &&
                <div { ...mergeProps("block", props => ({
                    ...props,
                    className: `flex flex-col gap-app-base bg-soft-bg px-app-base py-app-sm
                    text-strong-text shadow-md text-app-sm`
                }))}>
                    {children}
                </div>
            }
            {!isNil(footer) && 
                <div { ...mergeProps("footer", props => ({
                    ...props,
                    className: ` text-soft-text text-app-sm mx-app-xxs`
                }))}>
                    {footer}
                </div>
            }
        </div>
    );
}

Block.propTypes = propTypes;