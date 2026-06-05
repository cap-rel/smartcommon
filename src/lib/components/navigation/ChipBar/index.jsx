// Reusable chip bar. Each chip is filled when active, outlined when not.
// `hidden` chips are not rendered at all. `disabled` chips render but
// dim to mark a zero-count state (still clickable per spec).
//
// A chip carrying `variant: "status"` renders as a sub-filter: a square
// shape (rounded-md) instead of the source chips' pill, an optional
// leading `icon`, and caller-supplied `activeClassName` / `inactiveClassName`
// (status colors). This visually marks the done / to-complete chips as
// complementary filters of a source chip, not standalone sources.
//
// Designed to fit on a 375px viewport without horizontal overflow: chips
// wrap to a second line when needed (flex-wrap, not overflow-x-auto). This
// avoids the iPhone-specific horizontal-scroll bug seen with tab rows.
//
// Ported from smartInterventions (mobile/src/components/global/ChipBar).

import { twMerge } from "lib/utils";
import { useVariantMerger } from "lib/hooks";

import { defaultProps, propTypes } from "./props";

export const ChipBar = (props) => {
    const { variantProps, mergeProps } = useVariantMerger("ChipBar", props);

    const { chips } = variantProps;

    const visible = (chips ?? []).filter((c) => !c.hidden);

    return (
        <div {...mergeProps("container", (p) => ({
            ...p,
            "data-component": "ChipBar",
            "data-testid": p["data-testid"] ?? "chipbar",
            className: twMerge(
                "flex flex-wrap items-center gap-app-xs min-w-0",
                p.className,
            ),
        }))}>
            {visible.map((chip, idx) => {
                const {
                    key,
                    label,
                    count,
                    active,
                    onClick,
                    disabled,
                    variant,
                    icon: Icon,
                    activeClassName,
                    inactiveClassName,
                } = chip;

                const isStatus = variant === "status";

                // Source chips fall back to the default pill palette; status
                // sub-filters supply their own (status-coloured) classes.
                const activeClass = active
                    ? (activeClassName ?? "bg-primary text-white border-primary")
                    : (inactiveClassName ?? "bg-soft-bg text-strong-text border-border");

                const shapeClass = isStatus ? "rounded-md" : "rounded-full";
                const disabledClass = disabled ? "opacity-50" : "";

                return (
                    <button
                        key={key ?? `chip${idx}`}
                        type="button"
                        data-testid={`chip-${key}`}
                        data-active={active ? "true" : "false"}
                        onClick={onClick}
                        className={twMerge(
                            `flex items-center gap-app-xxs px-app-sm py-app-xxs
                            border text-app-sm font-app-semibold
                            whitespace-nowrap min-w-0 truncate
                            duration-(--really-quick) active:brightness-soft`,
                            shapeClass,
                            activeClass,
                            disabledClass,
                        )}
                    >
                        {Icon && <Icon className="shrink-0" />}
                        <span className="truncate min-w-0">{label}</span>
                        <span className="shrink-0">({count ?? 0})</span>
                    </button>
                );
            })}
        </div>
    );
};

ChipBar.propTypes = propTypes;
ChipBar.defaultProps = defaultProps;
