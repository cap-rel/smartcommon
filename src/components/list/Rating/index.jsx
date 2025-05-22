import { propTypes } from "./props";
import { useVariantToProps } from "../../../hooks";
import { Rater } from "../../form";

export const Rating = (props) => {
    const { variantProps, mergeProps, mergeQuickProps } = useVariantToProps("Rating", props);

    return (
        <Rater { ...mergeProps("Rating", props => ({
            ...props,
            ...mergeQuickProps(props, ["value", "icon"]),
            readOnly: true,
        }))}/>
    );
};

Rating.propTypes = propTypes;