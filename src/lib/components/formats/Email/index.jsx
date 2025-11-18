import { FaEnvelope } from "react-icons/fa6";

import { useVariantMerger } from "lib/hooks";

import { propTypes } from "./props";

export const Email = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Email", props);

    const { value } = variantProps;

    return (
        <a { ...mergeProps("link", props => ({
            href: `mailto:${value}`,
            ...props,
            className: `flex items-center gap-app-xs active:brightness-soft active:underline`,
        }))}>
            <div { ...mergeProps("icon", props => ({
                ...props,
                className: ``
            }))}>
                <FaEnvelope />
            </div>
            <div { ...mergeProps("email", props => ({
                ...props,
                className: `italic`
            }))}>
                {value}
            </div>
        </a>
    );
};

Email.propTypes = propTypes;