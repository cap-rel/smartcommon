import { FaPhoneFlip } from "react-icons/fa6";
import { useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";

export const PhoneNumber = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("PhoneNumber", props);

    const { value } = variantProps;

    return (
        <a { ...mergeProps("link", props => ({
            href: `tel:${value}`,
            ...props,
            className: `flex items-center gap-app-xs active:brightness-soft`,
        }))}>
            <div { ...mergeProps("icon", props => ({
                ...props,
                className: ``
            }))}>
                <FaPhoneFlip />
            </div>
            <div { ...mergeProps("phoneNumber", props => ({
                ...props,
                className: `font-app-semibold`
            }))}>
                {value}
            </div>
        </a>
    );
};

PhoneNumber.propTypes = propTypes;