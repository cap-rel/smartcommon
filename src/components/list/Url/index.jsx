import { FaLink, FaPhoneFlip } from "react-icons/fa6";
import { useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";

export const Url = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Url", props);

    const { value } = variantProps;

    return (
        <a { ...mergeProps("link", props => ({
            href: value,
            ...props,
            className: `flex items-center gap-app-xs active:brightness-soft active:underline`,
        }))}>
            <div { ...mergeProps("icon", props => ({
                ...props,
                className: ``
            }))}>
                <FaLink />
            </div>
            <div { ...mergeProps("url", props => ({
                ...props,
                className: ``
            }))}>
                {value}
            </div>
        </a>
    );
};

Url.propTypes = propTypes;