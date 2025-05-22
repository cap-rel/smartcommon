import { FaLocationDot } from "react-icons/fa6";
import { useVariantToProps } from "../../../hooks";
import { propTypes } from "./props";

export const Coordinates = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Coordinates", props);

    const { value } = variantProps;

    const [longitude, latitude] = value;

    return (
        <a { ...mergeProps("link", props => ({
            href: `geo:${longitude},${latitude}`,
            ...props,
            className: `flex items-center gap-app-xs active:brightness-soft`,
        }))}>
            <div { ...mergeProps("icon", props => ({
                ...props,
                className: ``
            }))}>
                <FaLocationDot />
            </div>
            <div { ...mergeProps("coordinates", props => ({
                ...props,
                className: `font-app-semibold`
            }))}>
                {`${longitude} - ${latitude}`}
            </div>
        </a>
    );
};

Coordinates.propTypes = propTypes;