import { useVariantMerger } from "../../../hooks";

export const Tag = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("tag", props);

    const { color, children } = variantProps;
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