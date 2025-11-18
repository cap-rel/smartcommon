import { useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

export const CarouselItem = (props) => {
    const { variantProps, mergeProps } =  useVariantMerger("CarouselItem", props);

    const {
        id,
        responsive = true,
        title
    } = variantProps;

    return (
        <div { ...mergeProps("container", props => ({
            ...props,
            "data-component": "CarouselItem",
            className: ""
        }))}>

        </div>
    );
};

CarouselItem.propTypes = propTypes;
CarouselItem.defaultProps = defaultProps;