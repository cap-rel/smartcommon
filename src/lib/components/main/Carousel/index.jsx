import { useVariantMerger } from "../../../hooks";
import { defaultProps, propTypes } from "./props";

export const Carousel = (props) => {
    const { variantProps, mergeProps } =  useVariantMerger("Carousel", props);
};

Carousel.propTypes = propTypes;
Carousel.defaultProps = defaultProps;