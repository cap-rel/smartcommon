import { useVariantMerger } from "../../../hooks";
import { defaultProps, propTypes } from "./props";

export const Carousel = (props) => {
    const { variantProps, mergeProps } =  useVariantMerger("Carousel", props);

    const {
        id,
        responsive = true,
        title
    } = variantProps;

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            "data-component": "Carousel",
            className: "flex"
        }))}>

        </div>
    );
};

Carousel.propTypes = propTypes;
Carousel.defaultProps = defaultProps;