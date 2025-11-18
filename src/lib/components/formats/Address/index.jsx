import { FaLocationDot } from "react-icons/fa6";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Address = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Address", props);

    const { value } = variantProps;

    return (
        <a { ...mergeProps("link", props => ({
            href: `geo:0,0?q=${value.replaceAll(" ", "+")}`,
            ...props,
            className: `flex items-center gap-app-xs active:brightness-soft`,
        }))}>
            <div { ...mergeProps("icon", props => ({
                ...props,
                className: ``
            }))}>
                <FaLocationDot />
            </div>
            <div { ...mergeProps("address", props => ({
                ...props,
                className: `font-app-semibold`
            }))}>
                {value}
            </div>
        </a>
    );
};

Address.propTypes = propTypes;