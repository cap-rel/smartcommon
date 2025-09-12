import { isArray } from "../../../globals";
import { useVariantToProps } from "../../../hooks";
import { Tag } from "../../others/Tag";
import { propTypes } from "./props";

export const Tags = (props) => {
    const { variantProps, mergeProps } = useVariantToProps("Tags", props);

    const { options, value, color } = variantProps;

    return (
        <div { ...mergeProps("tagsContainer", props => ({
            ...props,
            className: `flex flex-wrap gap-app-sm items-center`
        }))}>
            {isArray(value)
                ?   value.map((tag, TI) => {
                        const tagColor = options.find(tag => tag.value = tag).color;
                        return (
                            <Tag key={`tag${TI}`} { ...mergeProps("Tag", props => ({
                                ...props,
                                color: tagColor ?? color ?? "primary"
                            }))}>
                                {tag}
                            </Tag>
                        );
                    })
                :   <Tag { ...mergeProps("Tag", props => ({
                        ...props,
                        color: color ?? "primary"
                    }))}>
                        {value}
                    </Tag>
            }
        </div>
    );
};

Tags.prototypes = propTypes;