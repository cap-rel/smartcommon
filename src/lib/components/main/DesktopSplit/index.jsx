import { useVariantMerger } from "lib/hooks";
import { twMerge } from "lib/utils";

import { defaultProps, propTypes } from "./props";

/**
 * Desktop master-detail, always side by side: a desktop screen is wide, so
 * there is no orientation reflow (unlike a tablet master-detail). The master
 * (a dense DataTable, usually) keeps `masterWidth`, the detail takes the
 * rest and shows `placeholder` until something is selected.
 *
 * h-full: give it a bounded height, a `flex-1 min-h-0` container under a
 * DesktopHeader. Each pane scrolls on its own.
 */
export const DesktopSplit = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("DesktopSplit", props);
    const {
        master,
        detail,
        hasSelection = false,
        placeholder = null,
        masterWidth = "w-[56%] max-w-[860px]",
        masterClassName = "",
        detailClassName = "",
        testId = "desktop-split",
    } = variantProps;

    return (
        <div { ...mergeProps("container", p => ({
            ...p,
            "data-testid": testId,
            "data-component": "DesktopSplit",
            className: "flex h-full w-full overflow-hidden bg-medium-bg",
        }), { forwardAttributes: true })}>
            <section { ...mergeProps("master", p => ({
                ...p,
                "data-testid": `${testId}-master`,
                className: twMerge("h-full overflow-y-auto bg-soft-bg shrink-0 border-r border-border", masterWidth, masterClassName),
            }))}>
                {master}
            </section>
            <section { ...mergeProps("detail", p => ({
                ...p,
                "data-testid": `${testId}-detail`,
                className: twMerge("h-full overflow-y-auto flex-1 min-w-0", detailClassName),
            }))}>
                {hasSelection ? detail : placeholder}
            </section>
        </div>
    );
};

DesktopSplit.propTypes = propTypes;
DesktopSplit.defaultProps = defaultProps;
