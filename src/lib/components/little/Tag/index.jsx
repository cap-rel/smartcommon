import { useVariantMerger } from "lib/hooks";

import { propTypes, defaultProps } from "./props";

export const Tag = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Tag", props);

    // Destructured default: React 19 no longer applies static defaultProps
    // on function components.
    const { color = "success", children } = variantProps;
    return (
        <div { ...mergeProps("tag", props => ({
            ...props,
            style: {
                "--status-strong-color": `var(--color-strong-${color}-status)`,
                "--status-color": `var(--color-${color}-status)`
            },
            className: `whitespace-nowrap tracking-wide px-app-sm py-app-xxs
            uppercase rounded-full text-app-xs font-app-semibold
            text-(--status-strong-color) bg-(--status-color)/15`
        }))}>
            {children}
        </div>
    );
}

Tag.propTypes = propTypes;
Tag.defaultProps = defaultProps;
