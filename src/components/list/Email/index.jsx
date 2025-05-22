import { FaEnvelope, FaPhoneFlip } from "react-icons/fa6";
import { useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";

export const Email = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Email", props);

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