import { useVariantMerger } from "lib/hooks";

import { propTypes, defaultProps } from "./props";

// Base palette colour behind each accepted name. Every theme defines these
// (--color-success, --color-error, ...), and they ship in the built CSS. The
// status names come from the SmartInterventions statuses of theme.css.
const TAG_BASE_COLORS = {
    success: "success",
    danger: "error",
    error: "error",
    warning: "warning",
    info: "primary",
    primary: "primary",
    secondary: "secondary",
    neutral: "neutral",
    "to-complete": "warning",
    "in-progress": "primary",
    done: "success",
    "to-do": "neutral",
    draft: "warning",
    update: "primary",
};

/**
 * CSS colours of a tag. A `--color-<name>-status` (and its `strong`
 * variant) defined by the theme still wins; otherwise the base palette
 * applies, neutral for an unknown name.
 */
const resolveTagColors = (color) => {
    const base = Object.hasOwn(TAG_BASE_COLORS, color) ? TAG_BASE_COLORS[color] : "neutral";
    return {
        background: `var(--color-${color}-status, var(--color-${base}))`,
        text: `var(--color-strong-${color}-status, var(--color-strong-${base}, var(--color-${base})))`,
    };
};

export const Tag = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("Tag", props);

    // Destructured default: React 19 no longer applies static defaultProps
    // on function components.
    const { color = "success", children } = variantProps;
    const colors = resolveTagColors(color);

    return (
        <div { ...mergeProps("tag", props => ({
            ...props,
            style: {
                "--status-strong-color": colors.text,
                "--status-color": colors.background
            },
            className: `whitespace-nowrap tracking-wide px-app-sm py-app-xxs
            uppercase rounded-full text-app-xs font-app-semibold
            text-(--status-strong-color) bg-(--status-color)/15`
        }), { forwardAttributes: true })}>
            {children}
        </div>
    );
}

Tag.propTypes = propTypes;
Tag.defaultProps = defaultProps;
