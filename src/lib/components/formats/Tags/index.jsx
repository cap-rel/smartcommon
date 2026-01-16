import { isArray } from "lodash";

import { useVariantMerger } from "lib/hooks";
import { Tag } from "lib/components";

import { propTypes } from "./props";

export const Tags = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Tags", props);

    const { options, value, color } = variantProps;

    return (
        <div { ...mergeProps("tagsContainer", props => ({
            ...props,
            className: `flex flex-wrap gap-app-sm items-center`
        }))}>
            {isArray(value)
                ?   value.map((tag, TI) => {
                        const foundOption = (options ?? []).find(opt => opt.value === tag);
                        const tagColor = foundOption?.color;
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